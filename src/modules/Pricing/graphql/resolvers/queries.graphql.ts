// src/modules/pricing/graphql/resolvers/queries.graphql.ts
import { PrismaClient } from "@prisma/client";
import { PricingService } from "../../index";
import {
	pricingRuleFiltersSchema,
	calculateBookingPriceSchema,
} from "../../validation/pricing.validation";
import { createResolvers } from "../../../../helpers/createResolver";
import { protectedTenantResolver } from "../../../../helpers/safeResolver";

export const pricingQueries = {
	Query: {
		// ========================================================================
		// Pricing Rules
		// ========================================================================

		pricingRule: protectedTenantResolver(
			async (_parent, { id }, { prisma, tenantId }) => {
				const service = new PricingService(prisma);
				return service.getPricingRule(id);
			}
		),

		pricingRules: async (
			_parent: any,
			{ filters }: { filters: any },
			{ prisma }: { prisma: PrismaClient }
		) => {
			const validated = pricingRuleFiltersSchema.parse(filters);
			const service = new PricingService(prisma);

			return service.listPricingRules({
				tenantId: validated.tenantId,
				type: validated.type,
				status: validated.status,
				isDefault: validated.isDefault,
			});
		},

		// ========================================================================
		// Route Pricing
		// ========================================================================

		routePricing: async (
			_parent: any,
			{ routeId, pricingRuleId }: { routeId: string; pricingRuleId?: string },
			{ prisma }: { prisma: PrismaClient }
		) => {
			return prisma.routePricing.findMany({
				where: {
					routeId,
					pricingRuleId,
					deletedAt: null,
				},
				include: {
					pricingRule: true,
					route: true,
				},
			});
		},

		// ========================================================================
		// Station Pricing
		// ========================================================================

		stationPricing: async (
			_parent: any,
			{ routeId, pricingRuleId }: { routeId: string; pricingRuleId?: string },
			{ prisma }: { prisma: PrismaClient }
		) => {
			const service = new PricingService(prisma);
			return service.getStationPricing(routeId, pricingRuleId);
		},

		// ========================================================================
		// Trip Pricing
		// ========================================================================

		tripPricing: async (
			_parent: any,
			{ tripId }: { tripId: string },
			{ prisma }: { prisma: PrismaClient }
		) => {
			const service = new PricingService(prisma);
			return service.getTripPricing(tripId);
		},

		// ========================================================================
		// Discounts
		// ========================================================================

		discount: async (
			_parent: any,
			{ id }: { id: string },
			{ prisma }: { prisma: PrismaClient }
		) => {
			const service = new PricingService(prisma);
			return service.getDiscount(id);
		},

		discountByCode: async (
			_parent: any,
			{ code, tenantId }: { code: string; tenantId: string },
			{ prisma }: { prisma: PrismaClient }
		) => {
			const service = new PricingService(prisma);
			return service.getDiscountByCode(code, tenantId);
		},

		discounts: async (
			_parent: any,
			{ tenantId, isActive }: { tenantId: string; isActive?: boolean },
			{ prisma }: { prisma: PrismaClient }
		) => {
			const service = new PricingService(prisma);
			return service.listDiscounts(tenantId, isActive);
		},

		// ========================================================================
		// Price Calculation
		// ========================================================================

		calculateBookingPrice: async (
			_parent: any,
			{ input }: { input: any },
			{ prisma }: { prisma: PrismaClient }
		) => {
			const validated = calculateBookingPriceSchema.parse(input);
			const service = new PricingService(prisma);

			return service.calculateBookingPrice({
				tripId: validated.tripId,
				fromStationId: validated.fromStationId,
				toStationId: validated.toStationId,
				discountCode: validated.discountCode,
				passengers: validated.passengers,
			});
		},
	},
};
