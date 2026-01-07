// src/modules/pricing/pricing.service.ts
import { PrismaClient, PricingType, Prisma } from "@prisma/client";
import {
	CreatePricingRuleInput,
	UpdatePricingRuleInput,
	CreateRoutePricingInput,
	CreateStationPricingInput,
	BulkCreateStationPricingInput,
	SetTripPricingInput,
	CreateDiscountInput,
	UpdateDiscountInput,
	ApplyDiscountInput,
	CalculateBookingPriceInput,
} from "./validation/pricing.validation";
import { PricingCalculator } from "./utils/pricing-calculator";
import {
	convertDecimalToNumber,
	convertNumberToDecimal,
} from "../../helpers/convertNumberToDecimal";

export class PricingService {
	private prisma: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			this.prisma = new PrismaClient();
		} else {
			this.prisma = prisma;
		}
	}

	// ============================================================================
	// Pricing Rules Management
	// ============================================================================

	async createPricingRule(input: CreatePricingRuleInput) {
		// If setting as default, unset other default rules
		if (input.isDefault) {
			await this.prisma.pricingRule.updateMany({
				where: {
					tenantId: input.tenantId,
					isDefault: true,
					deletedAt: null,
				},
				data: { isDefault: false },
			});
		}

		return this.prisma.pricingRule.create({
			data: {
				...input,
				validFrom: input.validFrom ? new Date(input.validFrom) : null,
				validUntil: input.validUntil ? new Date(input.validUntil) : null,
			},
			include: {
				routePricing: true,
				stationPricing: true,
			},
		});
	}

	async updatePricingRule(input: UpdatePricingRuleInput) {
		const { id, ...updateData } = input;

		// If setting as default, unset other default rules
		if (input.isDefault) {
			const rule = await this.prisma.pricingRule.findUnique({
				where: { id },
				select: { tenantId: true },
			});

			if (rule) {
				await this.prisma.pricingRule.updateMany({
					where: {
						tenantId: rule.tenantId,
						isDefault: true,
						deletedAt: null,
						id: { not: id },
					},
					data: { isDefault: false },
				});
			}
		}

		return this.prisma.pricingRule.update({
			where: { id },
			data: {
				...updateData,
				validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
				validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
			},
			include: {
				routePricing: true,
				stationPricing: true,
			},
		});
	}

	async deletePricingRule(id: string) {
		return this.prisma.pricingRule.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	async getPricingRule(id: string) {
		return this.prisma.pricingRule.findUnique({
			where: { id, deletedAt: null },
			include: {
				routePricing: {
					where: { deletedAt: null },
					include: { route: true },
				},
				stationPricing: {
					where: { deletedAt: null },
					include: {
						route: true,
						fromStation: true,
						toStation: true,
					},
				},
			},
		});
	}

	async listPricingRules(filters: {
		tenantId: string;
		type?: PricingType;
		status?: string;
		isDefault?: boolean;
	}) {
		return this.prisma.pricingRule.findMany({
			where: {
				tenantId: filters.tenantId,
				type: filters.type,
				status: filters.status as any,
				isDefault: filters.isDefault,
				deletedAt: null,
			},
			include: {
				routePricing: {
					where: { deletedAt: null },
					include: { route: true },
				},
				stationPricing: {
					where: { deletedAt: null },
					include: {
						fromStation: true,
						toStation: true,
					},
				},
			},
			orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
		});
	}

	// ============================================================================
	// Route Pricing
	// ============================================================================

	async createRoutePricing(input: CreateRoutePricingInput) {
		// Check if pricing rule is route-based or flat-rate
		const rule = await this.prisma.pricingRule.findUnique({
			where: { id: input.pricingRuleId },
		});

		if (!rule || !["flat_rate", "distance_based"].includes(rule.type)) {
			throw new Error("Pricing rule must be flat_rate or distance_based type");
		}

		return this.prisma.routePricing.create({
			data: input,
			include: {
				route: true,
				pricingRule: true,
			},
		});
	}

	async updateRoutePricing(id: string, basePrice?: number, currency?: string) {
		return this.prisma.routePricing.update({
			where: { id },
			data: {
				basePrice: basePrice !== undefined ? basePrice : undefined,
				currency: currency || undefined,
			},
		});
	}

	async deleteRoutePricing(id: string) {
		return this.prisma.routePricing.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	// ============================================================================
	// Station-Based Pricing
	// ============================================================================

	async createStationPricing(input: CreateStationPricingInput) {
		const rule = await this.prisma.pricingRule.findUnique({
			where: { id: input.pricingRuleId },
		});

		if (!rule || rule.type !== "station_based") {
			throw new Error("Pricing rule must be station_based type");
		}

		return this.prisma.stationPricing.create({
			data: input,
			include: {
				fromStation: true,
				toStation: true,
				route: true,
			},
		});
	}

	async bulkCreateStationPricing(input: BulkCreateStationPricingInput) {
		const rule = await this.prisma.pricingRule.findUnique({
			where: { id: input.pricingRuleId },
		});

		if (!rule || rule.type !== "station_based") {
			throw new Error("Pricing rule must be station_based type");
		}

		const data = input.pricingMatrix.map((item) => ({
			pricingRuleId: input.pricingRuleId,
			routeId: input.routeId,
			...item,
			currency: "EGP",
		}));

		await this.prisma.stationPricing.createMany({
			data,
			skipDuplicates: true,
		});

		return this.prisma.stationPricing.findMany({
			where: {
				pricingRuleId: input.pricingRuleId,
				routeId: input.routeId,
				deletedAt: null,
			},
			include: {
				fromStation: true,
				toStation: true,
			},
		});
	}

	async deleteStationPricing(id: string) {
		return this.prisma.stationPricing.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	async getStationPricing(routeId: string, pricingRuleId?: string) {
		return this.prisma.stationPricing.findMany({
			where: {
				routeId,
				pricingRuleId,
				deletedAt: null,
			},
			include: {
				fromStation: true,
				toStation: true,
				pricingRule: true,
			},
			orderBy: {
				stationCount: "asc",
			},
		});
	}

	// ============================================================================
	// Trip Pricing
	// ============================================================================

	async setTripPricing(input: SetTripPricingInput) {
		// Delete existing pricing for this trip
		await this.prisma.tripPricing.updateMany({
			where: { tripId: input.tripId },
			data: { deletedAt: new Date() },
		});

		return this.prisma.tripPricing.create({
			data: input,
			include: {
				trip: {
					include: {
						route: true,
					},
				},
				pricingRule: true,
			},
		});
	}

	async autoSetTripPricing(tripId: string) {
		const trip = await this.prisma.trip.findUnique({
			where: { id: tripId },
			include: {
				route: true,
			},
		});

		if (!trip) {
			throw new Error("Trip not found");
		}

		const calculator = new PricingCalculator(this.prisma);
		const price = await calculator.calculateTripPrice(tripId);

		return this.setTripPricing({
			tripId,
			pricingRuleId: price.appliedRuleId,
			basePrice: price.basePrice,
			finalPrice: price.finalPrice,
			currency: price.currency,
		});
	}

	async getTripPricing(tripId: string) {
		return this.prisma.tripPricing.findFirst({
			where: {
				tripId,
				deletedAt: null,
			},
			include: {
				trip: {
					include: {
						route: true,
					},
				},
				pricingRule: true,
			},
		});
	}

	// ============================================================================
	// Discount Management
	// ============================================================================

	async createDiscount(input: CreateDiscountInput) {
		return this.prisma.discount.create({
			data: {
				...input,
				validFrom: new Date(input.validFrom),
				validUntil: new Date(input.validUntil),
			},
		});
	}

	async updateDiscount(input: UpdateDiscountInput) {
		const { id, ...updateData } = input;

		return this.prisma.discount.update({
			where: { id },
			data: {
				...updateData,
				validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
				validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
			},
		});
	}

	async deleteDiscount(id: string) {
		return this.prisma.discount.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	async getDiscount(id: string) {
		return this.prisma.discount.findUnique({
			where: { id, deletedAt: null },
			include: {
				bookingDiscounts: {
					where: { deletedAt: null },
					include: { booking: true },
				},
			},
		});
	}

	async getDiscountByCode(code: string, tenantId: string) {
		const now = new Date();
		return this.prisma.discount.findFirst({
			where: {
				code: code.toUpperCase(),
				tenantId,
				isActive: true,
				deletedAt: null,
				validFrom: { lte: now },
				validUntil: { gte: now },
			},
		});
	}

	async listDiscounts(tenantId: string, isActive?: boolean) {
		return this.prisma.discount.findMany({
			where: {
				tenantId,
				isActive,
				deletedAt: null,
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async applyDiscount(input: ApplyDiscountInput) {
		const booking = await this.prisma.booking.findUnique({
			where: { id: input.bookingId },
		});

		if (!booking) {
			throw new Error("Booking not found");
		}

		const discount = await this.getDiscountByCode(
			input.discountCode,
			booking.tenantId
		);

		if (!discount) {
			throw new Error("Invalid or expired discount code");
		}

		// Check usage limit
		if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
			throw new Error("Discount usage limit reached");
		}

		// Calculate discount amount
		const calculator = new PricingCalculator(this.prisma);
		const discountAmount = calculator.calculateDiscountAmount(
			convertDecimalToNumber(booking.price),
			discount
		);

		// Apply discount
		await this.prisma.$transaction([
			this.prisma.bookingDiscount.create({
				data: {
					bookingId: input.bookingId,
					discountId: discount.id,
					discountAmount,
				},
			}),
			this.prisma.discount.update({
				where: { id: discount.id },
				data: { usageCount: { increment: 1 } },
			}),
			this.prisma.booking.update({
				where: { id: input.bookingId },
				data: {
					discountAmount,
					finalPrice: convertDecimalToNumber(booking.price) - discountAmount,
				},
			}),
		]);

		return this.prisma.booking.findUnique({
			where: { id: input.bookingId },
			include: {
				bookingDiscounts: {
					include: { discount: true },
				},
			},
		});
	}

	// ============================================================================
	// Price Calculation
	// ============================================================================

	async calculateBookingPrice(input: CalculateBookingPriceInput) {
		const calculator = new PricingCalculator(this.prisma);

		const basePrice = await calculator.calculateTripPrice(
			input.tripId,
			input.fromStationId,
			input.toStationId
		);

		let discountAmount = 0;
		let discount = null;

		if (input.discountCode) {
			const trip = await this.prisma.trip.findUnique({
				where: { id: input.tripId },
				select: { tenantId: true },
			});

			if (trip) {
				discount = await this.getDiscountByCode(
					input.discountCode,
					trip.tenantId
				);

				if (discount) {
					discountAmount = calculator.calculateDiscountAmount(
						basePrice.finalPrice,
						discount
					);
				}
			}
		}

		const totalPrice = basePrice.finalPrice * input.passengers;
		const finalPrice = totalPrice - discountAmount;

		return {
			basePrice: basePrice.basePrice,
			pricePerPassenger: basePrice.finalPrice,
			passengers: input.passengers,
			subtotal: totalPrice,
			discountAmount,
			finalPrice,
			currency: basePrice.currency,
			appliedRule: basePrice.appliedRuleId,
			appliedDiscount: discount,
			breakdown: basePrice.breakdown,
		};
	}
}
