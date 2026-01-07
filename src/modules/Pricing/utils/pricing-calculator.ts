// src/modules/pricing/utils/pricing-calculator.ts
import { PrismaClient, PricingType, Discount, DiscountType } from '@prisma/client';

interface PriceBreakdown {
  basePrice: number;
  distanceCharge?: number;
  peakHourMultiplier?: number;
  stationBasedPrice?: number;
  finalPrice: number;
  currency: string;
  appliedRuleId?: string;
  breakdown: string[];
}

export class PricingCalculator {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate price for a trip with optional station-based pricing
   */
  async calculateTripPrice(
    tripId: string,
    fromStationId?: string,
    toStationId?: string
  ): Promise<PriceBreakdown> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: true,
        tripStations: {
          include: { station: true },
          orderBy: { scheduledArrivalTime: 'asc' },
        },
      },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Get applicable pricing rules
    const pricingRules = await this.getApplicablePricingRules(
      trip.tenantId,
      trip.routeId || undefined,
      trip.departureTime
    );

    if (pricingRules.length === 0) {
      throw new Error('No pricing rules found for this trip');
    }

    // Apply rules by priority
    for (const rule of pricingRules) {
      try {
        const price = await this.applyPricingRule(
          rule,
          trip,
          fromStationId,
          toStationId
        );
        
        if (price) {
          return price;
        }
      } catch (error) {
        console.error(`Error applying pricing rule ${rule.id}:`, error);
        continue;
      }
    }

    throw new Error('Unable to calculate price with available pricing rules');
  }

  /**
   * Get applicable pricing rules for a trip
   */
  private async getApplicablePricingRules(
    tenantId: string,
    routeId?: string,
    departureTime?: Date | null
  ) {
    const now = departureTime || new Date();
    const dayOfWeek = now.getDay();

    return this.prisma.pricingRule.findMany({
      where: {
        tenantId,
        status: 'active',
        deletedAt: null,
        OR: [
          { validFrom: null },
          { validFrom: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { validUntil: null },
              { validUntil: { gte: now } },
            ],
          },
        ],
      },
      include: {
        routePricing: {
          where: {
            routeId: routeId || undefined,
            deletedAt: null,
          },
        },
        stationPricing: {
          where: {
            routeId: routeId || undefined,
            deletedAt: null,
          },
          include: {
            fromStation: true,
            toStation: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Apply a specific pricing rule to calculate price
   */
  private async applyPricingRule(
    rule: any,
    trip: any,
    fromStationId?: string,
    toStationId?: string
  ): Promise<PriceBreakdown | null> {
    const breakdown: string[] = [];
    let basePrice = 0;
    let finalPrice = 0;

    switch (rule.type as PricingType) {
      case 'flat_rate':
        return this.applyFlatRate(rule, trip, breakdown);

      case 'distance_based':
        return this.applyDistanceBasedPricing(rule, trip, breakdown);

      case 'station_based':
        if (!fromStationId || !toStationId) {
          return null; // Station-based pricing requires stations
        }
        return this.applyStationBasedPricing(
          rule,
          trip,
          fromStationId,
          toStationId,
          breakdown
        );

      case 'time_based':
        return this.applyTimeBasedPricing(rule, trip, breakdown);

      case 'dynamic':
        return this.applyDynamicPricing(rule, trip, breakdown);

      default:
        return null;
    }
  }

  /**
   * Flat rate pricing
   */
  private async applyFlatRate(
    rule: any,
    trip: any,
    breakdown: string[]
  ): Promise<PriceBreakdown> {
    let basePrice = 0;

    // Check for route-specific pricing
    const routePricing = rule.routePricing.find(
      (rp: any) => rp.routeId === trip.routeId
    );

    if (routePricing) {
      basePrice = Number(routePricing.basePrice);
      breakdown.push(`Route base price: ${basePrice} EGP`);
    } else if (rule.basePrice) {
      basePrice = Number(rule.basePrice);
      breakdown.push(`Standard base price: ${basePrice} EGP`);
    } else {
      throw new Error('No base price configured for flat rate');
    }

    const finalPrice = basePrice;

    return {
      basePrice,
      finalPrice,
      currency: 'EGP',
      appliedRuleId: rule.id,
      breakdown,
    };
  }

  /**
   * Distance-based pricing
   */
  private async applyDistanceBasedPricing(
    rule: any,
    trip: any,
    breakdown: string[]
  ): Promise<PriceBreakdown> {
    if (!trip.route?.distanceKm) {
      throw new Error('Route distance not available');
    }

    const distance = Number(trip.route.distanceKm);
    const pricePerKm = Number(rule.pricePerKm);
    
    let basePrice = distance * pricePerKm;
    breakdown.push(`Distance: ${distance}km × ${pricePerKm} EGP/km = ${basePrice} EGP`);

    // Apply min/max price constraints
    if (rule.minPrice && basePrice < Number(rule.minPrice)) {
      basePrice = Number(rule.minPrice);
      breakdown.push(`Applied minimum price: ${basePrice} EGP`);
    }

    if (rule.maxPrice && basePrice > Number(rule.maxPrice)) {
      basePrice = Number(rule.maxPrice);
      breakdown.push(`Applied maximum price: ${basePrice} EGP`);
    }

    return {
      basePrice,
      distanceCharge: basePrice,
      finalPrice: basePrice,
      currency: 'EGP',
      appliedRuleId: rule.id,
      breakdown,
    };
  }

  /**
   * Station-based pricing
   */
  private async applyStationBasedPricing(
    rule: any,
    trip: any,
    fromStationId: string,
    toStationId: string,
    breakdown: string[]
  ): Promise<PriceBreakdown> {
    // Find specific station pricing
    const stationPrice = rule.stationPricing.find(
      (sp: any) =>
        sp.fromStationId === fromStationId &&
        sp.toStationId === toStationId
    );

    if (stationPrice) {
      const price = Number(stationPrice.price);
      breakdown.push(
        `Station pricing: ${stationPrice.fromStation.name} → ${stationPrice.toStation.name} = ${price} EGP`
      );

      return {
        basePrice: price,
        stationBasedPrice: price,
        finalPrice: price,
        currency: stationPrice.currency,
        appliedRuleId: rule.id,
        breakdown,
      };
    }

    // Calculate based on station count if no direct pricing found
    const stations = trip.tripStations.map((ts: any) => ts.station);
    const fromIndex = stations.findIndex((s: any) => s.id === fromStationId);
    const toIndex = stations.findIndex((s: any) => s.id === toStationId);

    if (fromIndex === -1 || toIndex === -1) {
      throw new Error('Invalid station selection');
    }

    const stationCount = Math.abs(toIndex - fromIndex);

    // Find closest station count pricing
    const sortedPricing = rule.stationPricing
      .filter((sp: any) => sp.routeId === trip.routeId)
      .sort((a: any, b: any) => a.stationCount - b.stationCount);

    const applicablePricing = sortedPricing.find(
      (sp: any) => sp.stationCount >= stationCount
    ) || sortedPricing[sortedPricing.length - 1];

    if (!applicablePricing) {
      throw new Error('No station pricing configuration found');
    }

    const price = Number(applicablePricing.price);
    breakdown.push(
      `${stationCount} stations: ${price} EGP (based on ${applicablePricing.stationCount}-station pricing)`
    );

    return {
      basePrice: price,
      stationBasedPrice: price,
      finalPrice: price,
      currency: 'EGP',
      appliedRuleId: rule.id,
      breakdown,
    };
  }

  /**
   * Time-based (peak hours) pricing
   */
  private async applyTimeBasedPricing(
    rule: any,
    trip: any,
    breakdown: string[]
  ): Promise<PriceBreakdown> {
    // First calculate base price using flat rate or distance
    let basePrice = 0;

    if (rule.basePrice) {
      basePrice = Number(rule.basePrice);
    } else {
      throw new Error('Base price required for time-based pricing');
    }

    breakdown.push(`Base price: ${basePrice} EGP`);

    // Check if trip is during peak hours
    const departureTime = trip.departureTime ? new Date(trip.departureTime) : new Date();
    const hours = departureTime.getHours();
    const minutes = departureTime.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const isPeakHour = this.isTimeBetween(
      timeString,
      rule.peakStartTime,
      rule.peakEndTime
    );

    let finalPrice = basePrice;

    if (isPeakHour && rule.peakMultiplier) {
      const multiplier = Number(rule.peakMultiplier);
      finalPrice = basePrice * multiplier;
      breakdown.push(
        `Peak hour multiplier (${rule.peakStartTime}-${rule.peakEndTime}): ×${multiplier} = ${finalPrice} EGP`
      );
    }

    return {
      basePrice,
      peakHourMultiplier: isPeakHour ? Number(rule.peakMultiplier) : undefined,
      finalPrice,
      currency: 'EGP',
      appliedRuleId: rule.id,
      breakdown,
    };
  }

  /**
   * Dynamic pricing (can be extended with ML models)
   */
  private async applyDynamicPricing(
    rule: any,
    trip: any,
    breakdown: string[]
  ): Promise<PriceBreakdown> {
    // For now, use base price with demand-based adjustment
    let basePrice = Number(rule.basePrice || 0);

    // Calculate demand factor based on available seats
    const totalSeats = trip.bus?.capacity || 50;
    const availableSeats = trip.availableSeats || totalSeats;
    const occupancyRate = ((totalSeats - availableSeats) / totalSeats);

    let demandMultiplier = 1.0;

    if (occupancyRate > 0.8) {
      demandMultiplier = 1.5; // 50% increase for high demand
    } else if (occupancyRate > 0.6) {
      demandMultiplier = 1.3; // 30% increase for medium demand
    } else if (occupancyRate > 0.4) {
      demandMultiplier = 1.1; // 10% increase for moderate demand
    }

    const finalPrice = basePrice * demandMultiplier;

    breakdown.push(`Base price: ${basePrice} EGP`);
    breakdown.push(
      `Occupancy rate: ${(occupancyRate * 100).toFixed(0)}% (${totalSeats - availableSeats}/${totalSeats} seats)`
    );
    breakdown.push(
      `Demand multiplier: ×${demandMultiplier} = ${finalPrice} EGP`
    );

    return {
      basePrice,
      finalPrice,
      currency: 'EGP',
      appliedRuleId: rule.id,
      breakdown,
    };
  }

  /**
   * Calculate discount amount
   */
  calculateDiscountAmount(price: number, discount: Discount): number {
    let discountAmount = 0;

    // Check minimum amount
    if (discount.minAmount && price < Number(discount.minAmount)) {
      return 0;
    }

    if (discount.type === DiscountType.percentage) {
      discountAmount = (price * Number(discount.value)) / 100;
    } else {
      discountAmount = Number(discount.value);
    }

    // Apply max discount limit
    if (discount.maxDiscount && discountAmount > Number(discount.maxDiscount)) {
      discountAmount = Number(discount.maxDiscount);
    }

    // Discount cannot exceed price
    return Math.min(discountAmount, price);
  }

  /**
   * Helper to check if time is between two time strings
   */
  private isTimeBetween(time: string, start: string, end: string): boolean {
    const timeNum = this.timeToNumber(time);
    const startNum = this.timeToNumber(start);
    const endNum = this.timeToNumber(end);

    if (startNum <= endNum) {
      return timeNum >= startNum && timeNum <= endNum;
    } else {
      // Handle case where end time is past midnight
      return timeNum >= startNum || timeNum <= endNum;
    }
  }

  private timeToNumber(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}