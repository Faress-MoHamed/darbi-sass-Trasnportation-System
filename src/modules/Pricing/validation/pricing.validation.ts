// src/modules/pricing/validation/pricing.validation.ts
import { z } from 'zod';

export const PricingTypeEnum = z.enum([
  'flat_rate',
  'distance_based',
  'station_based',
  'dynamic',
  'time_based'
]);

export const PricingStatusEnum = z.enum(['active', 'inactive', 'scheduled']);

export const DiscountTypeEnum = z.enum(['percentage', 'fixed_amount']);

// Create Pricing Rule
export const createPricingRuleSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  type: PricingTypeEnum,
  status: PricingStatusEnum.default('active'),
  priority: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  basePrice: z.number().positive().optional(),
  pricePerKm: z.number().positive().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  peakMultiplier: z.number().min(1).optional(),
  peakStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  peakEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  applicableDays: z.array(z.number().min(0).max(6)).optional(),
  metadata: z.any().optional(),
}).refine(
  (data) => {
    if (data.type === 'flat_rate' && !data.basePrice) {
      return false;
    }
    if (data.type === 'distance_based' && !data.pricePerKm) {
      return false;
    }
    if (data.type === 'time_based' && (!data.peakMultiplier || !data.peakStartTime || !data.peakEndTime)) {
      return false;
    }
    return true;
  },
  {
    message: 'Invalid pricing configuration for the selected type',
  }
);

// Update Pricing Rule
export const updatePricingRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  type: PricingTypeEnum.optional(),
  status: PricingStatusEnum.optional(),
  priority: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  basePrice: z.number().positive().optional(),
  pricePerKm: z.number().positive().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  peakMultiplier: z.number().min(1).optional(),
  peakStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  peakEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  applicableDays: z.array(z.number().min(0).max(6)).optional(),
  metadata: z.any().optional(),
});

// Route Pricing
export const createRoutePricingSchema = z.object({
  pricingRuleId: z.string().uuid(),
  routeId: z.string().uuid(),
  basePrice: z.number().positive(),
  currency: z.string().length(3).default('EGP'),
});

export const updateRoutePricingSchema = z.object({
  id: z.string().uuid(),
  basePrice: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
});

// Station-Based Pricing
export const createStationPricingSchema = z.object({
  pricingRuleId: z.string().uuid(),
  routeId: z.string().uuid(),
  fromStationId: z.string().uuid(),
  toStationId: z.string().uuid(),
  price: z.number().positive(),
  stationCount: z.number().int().positive(),
  currency: z.string().length(3).default('EGP'),
}).refine(
  (data) => data.fromStationId !== data.toStationId,
  {
    message: 'From and To stations must be different',
  }
);

export const bulkCreateStationPricingSchema = z.object({
  pricingRuleId: z.string().uuid(),
  routeId: z.string().uuid(),
  pricingMatrix: z.array(z.object({
    fromStationId: z.string().uuid(),
    toStationId: z.string().uuid(),
    price: z.number().positive(),
    stationCount: z.number().int().positive(),
  })),
});

// Trip Pricing
export const setTripPricingSchema = z.object({
  tripId: z.string().uuid(),
  pricingRuleId: z.string().uuid().optional(),
  basePrice: z.number().positive(),
  finalPrice: z.number().positive(),
  currency: z.string().length(3).default('EGP'),
});

export const calculateTripPriceSchema = z.object({
  tripId: z.string().uuid(),
  fromStationId: z.string().uuid().optional(),
  toStationId: z.string().uuid().optional(),
});

// Discount
export const createDiscountSchema = z.object({
  tenantId: z.string().uuid(),
  code: z.string().min(1).max(50).toUpperCase(),
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  type: DiscountTypeEnum,
  value: z.number().positive(),
  minAmount: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.type === 'percentage' && data.value > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'Percentage discount cannot exceed 100%',
  }
).refine(
  (data) => new Date(data.validFrom) < new Date(data.validUntil),
  {
    message: 'Valid from date must be before valid until date',
  }
);

export const updateDiscountSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50).toUpperCase().optional(),
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  type: DiscountTypeEnum.optional(),
  value: z.number().positive().optional(),
  minAmount: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const applyDiscountSchema = z.object({
  bookingId: z.string().uuid(),
  discountCode: z.string().min(1).max(50).toUpperCase(),
});

// Query Filters
export const pricingRuleFiltersSchema = z.object({
  tenantId: z.string().uuid(),
  type: PricingTypeEnum.optional(),
  status: PricingStatusEnum.optional(),
  isDefault: z.boolean().optional(),
  validAt: z.string().datetime().optional(),
});

export const discountFiltersSchema = z.object({
  tenantId: z.string().uuid(),
  isActive: z.boolean().optional(),
  code: z.string().optional(),
  validAt: z.string().datetime().optional(),
});

// Price Calculation
export const calculateBookingPriceSchema = z.object({
  tripId: z.string().uuid(),
  fromStationId: z.string().uuid().optional(),
  toStationId: z.string().uuid().optional(),
  discountCode: z.string().optional(),
  passengers: z.number().int().positive().default(1),
});

export type CreatePricingRuleInput = z.infer<typeof createPricingRuleSchema>;
export type UpdatePricingRuleInput = z.infer<typeof updatePricingRuleSchema>;
export type CreateRoutePricingInput = z.infer<typeof createRoutePricingSchema>;
export type CreateStationPricingInput = z.infer<typeof createStationPricingSchema>;
export type BulkCreateStationPricingInput = z.infer<typeof bulkCreateStationPricingSchema>;
export type SetTripPricingInput = z.infer<typeof setTripPricingSchema>;
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;
export type CalculateBookingPriceInput = z.infer<typeof calculateBookingPriceSchema>;