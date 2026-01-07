// src/modules/pricing/graphql/resolvers/mutations.graphql.ts
import { PrismaClient } from '@prisma/client';
import { PricingService } from '../../index';
import {
  createPricingRuleSchema,
  updatePricingRuleSchema,
  createRoutePricingSchema,
  updateRoutePricingSchema,
  createStationPricingSchema,
  bulkCreateStationPricingSchema,
  setTripPricingSchema,
  createDiscountSchema,
  updateDiscountSchema,
  applyDiscountSchema,
} from '../../validation/pricing.validation';

export const pricingMutations = {
  Mutation: {
    // ========================================================================
    // Pricing Rules
    // ========================================================================
    
    createPricingRule: async (
      _parent: any,
      { input }: { input: any },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = createPricingRuleSchema.parse(input);
      const service = new PricingService(prisma);
      
      return service.createPricingRule(validated);
    },

    updatePricingRule: async (
      _parent: any,
      { input }: { input: any },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = updatePricingRuleSchema.parse(input);
      const service = new PricingService(prisma);
      
      return service.updatePricingRule(validated);
    },

    deletePricingRule: async (
      _parent: any,
      { id }: { id: string },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const service = new PricingService(prisma);
      await service.deletePricingRule(id);
      return true;
    },

    // ========================================================================
    // Route Pricing
    // ========================================================================
    
    createRoutePricing: async (
      _parent: any,
      { input }: { input: any },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = createRoutePricingSchema.parse(input);
      const service = new PricingService(prisma);
      
      return service.createRoutePricing(validated);
    },

    updateRoutePricing: async (
      _parent: any,
      { id, basePrice, currency }: { id: string; basePrice?: number; currency?: string },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const service = new PricingService(prisma);
      return service.updateRoutePricing(id, basePrice, currency);
    },

    deleteRoutePricing: async (
      _parent: any,
      { id }: { id: string },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const service = new PricingService(prisma);
      await service.deleteRoutePricing(id);
      return true;
    },

    // ========================================================================
    // Station Pricing
    // ========================================================================
    
    createStationPricing: async (
      _parent: any,
      { input }: { input: any },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = createStationPricingSchema.parse(input);
      const service = new PricingService(prisma);
      
      return service.createStationPricing(validated);
    },

    bulkCreateStationPricing: async (
      _parent: any,
      { input }: { input: any },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = bulkCreateStationPricingSchema.parse(input);
      const service = new PricingService(prisma);
      
      return service.bulkCreateStationPricing(validated);
    },

    deleteStationPricing: async (
      _parent: any,
      { id }: { id: string },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const service = new PricingService(prisma);
      await service.deleteStationPricing(id);
      return true;
    },

    // ========================================================================
    // Trip Pricing
    // ========================================================================
    
    setTripPricing: async (
      _parent: any,
      { input }: { input: any },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = setTripPricingSchema.parse(input);
      const service = new PricingService(prisma);
      
      return service.setTripPricing(validated);
    },

    autoSetTripPricing: async (
      _parent: any,
      { tripId }: { tripId: string },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const service = new PricingService(prisma);
      return service.autoSetTripPricing(tripId);
    },

    // ========================================================================
    // Discounts
    // ========================================================================
    
    createDiscount: async (
      _parent: any,
      { input }: { input: any },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = createDiscountSchema.parse(input);
      const service = new PricingService(prisma);
      
      return service.createDiscount(validated);
    },

    updateDiscount: async (
      _parent: any,
      { input }: { input: any },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = updateDiscountSchema.parse(input);
      const service = new PricingService(prisma);
      
      return service.updateDiscount(validated);
    },

    deleteDiscount: async (
      _parent: any,
      { id }: { id: string },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const service = new PricingService(prisma);
      await service.deleteDiscount(id);
      return true;
    },

    applyDiscount: async (
      _parent: any,
      { bookingId, discountCode }: { bookingId: string; discountCode: string },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const validated = applyDiscountSchema.parse({ bookingId, discountCode });
      const service = new PricingService(prisma);
      
      return service.applyDiscount(validated);
    },
  },
};