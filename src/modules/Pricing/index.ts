import { PrismaClient } from "@prisma/client";
import { AppError } from "../../errors/AppError";

interface PriceCalculationResult {
	basePrice: number;
	distanceCharge: number;
	dynamicAdjustment: number;
	subscriptionDiscount: number;
	promoDiscount: number;
	taxAmount: number;
	finalPrice: number;
	currency: string;
	breakdown: {
		description: string;
		amount: number;
	}[];
}

interface BookingPriceParams {
	tenantId: string;
	tripId: string;
	passengerId: string;
	fromStationId?: string;
	toStationId?: string;
	promoCode?: string;
}

interface SubscriptionPurchaseParams {
	tenantId: string;
	passengerId: string;
	planId: string;
}

export class PricingService {
	private prisma: PrismaClient;

	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("PrismaClient instance is required");
		}
		this.prisma = prisma;
	}

	/**
	 * Calculate booking price with all adjustments
	 */
	async calculateBookingPrice(
		params: BookingPriceParams
	): Promise<PriceCalculationResult> {
		const {
			tenantId,
			tripId,
			passengerId,
			fromStationId,
			toStationId,
			promoCode,
		} = params;

		// Fetch trip details
		const trip = await this.prisma.trip.findFirst({
			where: { id: tripId, tenantId, deletedAt: null },
			include: {
				route: true,
				bus: true,
			},
		});

		if (!trip || !trip.route) {
			throw new AppError("Trip not found", 404);
		}

		const breakdown: { description: string; amount: number }[] = [];
		let basePrice = 0;
		let distanceCharge = 0;
		let dynamicAdjustment = 0;
		let subscriptionDiscount = 0;
		let promoDiscount = 0;
		let taxAmount = 0;

		// 1. Calculate base price
		if (fromStationId && toStationId) {
			// Check for station pair pricing
			const stationPairPrice = await this.getStationPairPrice(
				tenantId,
				fromStationId,
				toStationId,
				trip.routeId
			);

			if (stationPairPrice) {
				basePrice = Number(stationPairPrice.price);
				breakdown.push({
					description: "Station pair fare",
					amount: basePrice,
				});
			} else {
				// Calculate using route pricing
				const routePrice = await this.getRoutePricing(tenantId, trip.routeId);

				if (routePrice) {
					if (routePrice.pricingType === "per_km") {
						const distance = await this.calculateStationDistance(
							fromStationId,
							toStationId,
							trip.routeId
						);
						distanceCharge = Number(routePrice.pricePerKm || 0) * distance;
						basePrice = Number(routePrice.basePrice) + distanceCharge;

						breakdown.push({
							description: "Base fare",
							amount: Number(routePrice.basePrice),
						});
						breakdown.push({
							description: `Distance charge (${distance}km)`,
							amount: distanceCharge,
						});
					} else {
						basePrice = Number(routePrice.basePrice);
						breakdown.push({
							description: "Base fare",
							amount: basePrice,
						});
					}
				}
			}
		} else {
			// Full trip pricing
			const routePrice = await this.getRoutePricing(tenantId, trip.routeId);
			basePrice = routePrice ? Number(routePrice.basePrice) : 0;
			breakdown.push({
				description: "Full route fare",
				amount: basePrice,
			});
		}

		// 2. Apply dynamic pricing rules
		dynamicAdjustment = await this.calculateDynamicAdjustment(
			tenantId,
			trip,
			basePrice
		);

		if (dynamicAdjustment !== 0) {
			breakdown.push({
				description:
					dynamicAdjustment > 0 ? "Peak hour surcharge" : "Off-peak discount",
				amount: dynamicAdjustment,
			});
		}

		// 3. Check for active subscription
		const subscription = await this.getActiveSubscription(
			passengerId,
			tenantId
		);

		if (subscription && subscription.plan) {
			const discountPercentage = Number(
				subscription.plan.discountPercentage || 0
			);
			subscriptionDiscount =
				(basePrice + dynamicAdjustment) * (discountPercentage / 100);

			breakdown.push({
				description: `Subscription discount (${discountPercentage}%)`,
				amount: -subscriptionDiscount,
			});
		}

		// 4. Apply promo code
		if (promoCode) {
			const promo = await this.validatePromoCode(
				tenantId,
				promoCode,
				passengerId
			);

			if (promo) {
				const subtotal = basePrice + dynamicAdjustment - subscriptionDiscount;

				if (promo.discountType === "percentage") {
					promoDiscount = subtotal * (Number(promo.discountValue) / 100);
				} else {
					promoDiscount = Number(promo.discountValue);
				}

				breakdown.push({
					description: `Promo code: ${promo.code}`,
					amount: -promoDiscount,
				});
			}
		}

		// 5. Calculate tax (if applicable)
		// You can add tax calculation logic here based on tenant settings
		const taxRate = 0; // Get from tenant settings
		if (taxRate > 0) {
			const subtotal =
				basePrice + dynamicAdjustment - subscriptionDiscount - promoDiscount;
			taxAmount = subtotal * taxRate;
			breakdown.push({
				description: `Tax (${taxRate * 100}%)`,
				amount: taxAmount,
			});
		}

		const finalPrice = Math.max(
			0,
			basePrice +
				distanceCharge +
				dynamicAdjustment -
				subscriptionDiscount -
				promoDiscount +
				taxAmount
		);

		return {
			basePrice,
			distanceCharge,
			dynamicAdjustment,
			subscriptionDiscount,
			promoDiscount,
			taxAmount,
			finalPrice,
			currency: "USD",
			breakdown,
		};
	}

	/**
	 * Create booking with price record
	 */
	async createBookingWithPrice(
		params: BookingPriceParams,
		bookingId: string
	): Promise<void> {
		const priceResult = await this.calculateBookingPrice(params);

		await this.prisma.bookingPrice.create({
			data: {
				bookingId,
				tenantId: params.tenantId,
				basePrice: priceResult.basePrice,
				distanceCharge: priceResult.distanceCharge,
				dynamicAdjustment: priceResult.dynamicAdjustment,
				subscriptionDiscount: priceResult.subscriptionDiscount,
				promoDiscount: priceResult.promoDiscount,
				taxAmount: priceResult.taxAmount,
				finalPrice: priceResult.finalPrice,
				currency: priceResult.currency,
				pricingSnapshot: priceResult as any,
			},
		});

		// Record promo code usage if applicable
		if (params.promoCode) {
			const promo = await this.prisma.promoCode.findFirst({
				where: {
					tenantId: params.tenantId,
					code: params.promoCode,
					active: true,
				},
			});

			if (promo) {
				await this.prisma.promoCodeUsage.create({
					data: {
						promoCodeId: promo.id,
						bookingId,
						userId: params.passengerId,
						discount: priceResult.promoDiscount,
					},
				});

				// Increment usage count
				await this.prisma.promoCode.update({
					where: { id: promo.id },
					data: { usedCount: { increment: 1 } },
				});
			}
		}
	}

	/**
	 * Calculate subscription purchase price
	 */
	async calculateSubscriptionPrice(
		params: SubscriptionPurchaseParams
	): Promise<PriceCalculationResult> {
		const { tenantId, planId } = params;

		const plan = await this.prisma.subscriptionPlan.findFirst({
			where: {
				id: planId,
				tenantId,
				active: true,
				deletedAt: null,
			},
		});

		if (!plan) {
			throw new AppError("Subscription plan not found", 404);
		}

		const basePrice = Number(plan.price);

		return {
			basePrice,
			distanceCharge: 0,
			dynamicAdjustment: 0,
			subscriptionDiscount: 0,
			promoDiscount: 0,
			taxAmount: 0,
			finalPrice: basePrice,
			currency: plan.currency,
			breakdown: [
				{
					description: `${plan.name} - ${plan.type}`,
					amount: basePrice,
				},
			],
		};
	}

	/**
	 * Get active route pricing
	 */
	private async getRoutePricing(tenantId: string, routeId: string) {
		return this.prisma.routePricing.findFirst({
			where: {
				tenantId,
				routeId,
				active: true,
				effectiveFrom: { lte: new Date() },
				OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
				deletedAt: null,
			},
			orderBy: { effectiveFrom: "desc" },
		});
	}

	/**
	 * Get station pair pricing
	 */
	private async getStationPairPrice(
		tenantId: string,
		fromStationId: string,
		toStationId: string,
		routeId: string
	) {
		return this.prisma.stationPairPricing.findFirst({
			where: {
				tenantId,
				fromStationId,
				toStationId,
				routeId,
				active: true,
				effectiveFrom: { lte: new Date() },
				OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
				deletedAt: null,
			},
			orderBy: { effectiveFrom: "desc" },
		});
	}

	/**
	 * Calculate distance between stations on a route
	 */
	private async calculateStationDistance(
		fromStationId: string,
		toStationId: string,
		routeId: string
	): Promise<number> {
		const stations = await this.prisma.station.findMany({
			where: {
				routeId,
				id: { in: [fromStationId, toStationId] },
			},
			orderBy: { sequence: "asc" },
		});

		if (stations.length !== 2) {
			return 0;
		}

		// Get all stations between the two
		const fromSequence = stations[0].sequence || 0;
		const toSequence = stations[1].sequence || 0;
		const [minSeq, maxSeq] = [
			Math.min(fromSequence, toSequence),
			Math.max(fromSequence, toSequence),
		];

		const routeStations = await this.prisma.station.findMany({
			where: {
				routeId,
				sequence: { gte: minSeq, lte: maxSeq },
			},
			orderBy: { sequence: "asc" },
		});

		// Calculate distance using lat/lng if available
		let totalDistance = 0;
		for (let i = 0; i < routeStations.length - 1; i++) {
			const from = routeStations[i];
			const to = routeStations[i + 1];

			if (from.latitude && from.longitude && to.latitude && to.longitude) {
				totalDistance += this.calculateHaversineDistance(
					Number(from.latitude),
					Number(from.longitude),
					Number(to.latitude),
					Number(to.longitude)
				);
			}
		}

		return Math.round(totalDistance * 10) / 10; // Round to 1 decimal
	}

	/**
	 * Calculate Haversine distance between two coordinates
	 */
	private calculateHaversineDistance(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number {
		const R = 6371; // Earth's radius in km
		const dLat = this.toRadians(lat2 - lat1);
		const dLon = this.toRadians(lon2 - lon1);

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.toRadians(lat1)) *
				Math.cos(this.toRadians(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	private toRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}

	/**
	 * Calculate dynamic pricing adjustments
	 */
	private async calculateDynamicAdjustment(
		tenantId: string,
		trip: any,
		basePrice: number
	): Promise<number> {
		const now = new Date();
		const dayOfWeek = now.getDay();
		const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
			.getMinutes()
			.toString()
			.padStart(2, "0")}`;

		const rules = await this.prisma.dynamicPricingRule.findMany({
			where: {
				tenantId,
				active: true,
				OR: [{ routeId: null }, { routeId: trip.routeId }],
				effectiveFrom: { lte: now },
				OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
				deletedAt: null,
			},
			orderBy: { priority: "desc" },
		});

		let totalAdjustment = 0;

		for (const rule of rules) {
			// Check day of week
			if (rule.dayOfWeek !== null && rule.dayOfWeek !== dayOfWeek) {
				continue;
			}

			// Check time range
			if (rule.startTime && rule.endTime) {
				if (currentTime < rule.startTime || currentTime > rule.endTime) {
					continue;
				}
			}

			// Apply adjustment
			if (rule.multiplier) {
				totalAdjustment += basePrice * (Number(rule.multiplier) - 1);
			}

			if (rule.fixedAdjustment) {
				totalAdjustment += Number(rule.fixedAdjustment);
			}
		}

		return totalAdjustment;
	}

	/**
	 * Get active subscription for passenger
	 */
	private async getActiveSubscription(passengerId: string, tenantId: string) {
		return this.prisma.subscription.findFirst({
			where: {
				passengerId,
				tenantId,
				status: "active",
				startDate: { lte: new Date() },
				endDate: { gte: new Date() },
				deletedAt: null,
			},
			include: {
				plan: true,
			},
		});
	}

	/**
	 * Validate and get promo code
	 */
	private async validatePromoCode(
		tenantId: string,
		code: string,
		userId: string
	) {
		const promo = await this.prisma.promoCode.findFirst({
			where: {
				tenantId,
				code,
				active: true,
				validFrom: { lte: new Date() },
				OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
				deletedAt: null,
			},
		});

		if (!promo) {
			return null;
		}

		// Check max uses
		if (promo.maxUses && promo.usedCount >= promo.maxUses) {
			return null;
		}

		// Check per-user usage
		if (promo.maxUsesPerUser) {
			const userUsageCount = await this.prisma.promoCodeUsage.count({
				where: {
					promoCodeId: promo.id,
					userId,
				},
			});

			if (userUsageCount >= promo.maxUsesPerUser) {
				return null;
			}
		}

		return promo;
	}

	/**
	 * Get all active subscription plans
	 */
	async getSubscriptionPlans(
		tenantId: string,
		filters?: {
			type?: string;
			routeId?: string;
		}
	) {
		return this.prisma.subscriptionPlan.findMany({
			where: {
				tenantId,
				active: true,
				deletedAt: null,
				...(filters?.type && { type: filters.type as any }),
				...(filters?.routeId && { routeId: filters.routeId }),
			},
			orderBy: [{ type: "asc" }, { price: "asc" }],
		});
	}
}
