// src/modules/pricing/helpers/pricing.helpers.ts
import { PrismaClient, PricingType, PricingStatus } from '@prisma/client';

export class PricingHelpers {
  /**
   * Generate a station pricing matrix for a route
   * Creates pricing entries for all station combinations
   */
  static async generateStationPricingMatrix(
    prisma: PrismaClient,
    routeId: string,
    basePrice: number = 10,
    pricePerStation: number = 5
  ) {
    // Get all stations for the route in sequence
    const stations = await prisma.station.findMany({
      where: {
        routeId,
        deletedAt: null,
      },
      orderBy: { sequence: 'asc' },
    });

    const pricingMatrix = [];

    // Generate pricing for all combinations
    for (let i = 0; i < stations.length; i++) {
      for (let j = i + 1; j < stations.length; j++) {
        const stationCount = j - i;
        const price = basePrice + (stationCount * pricePerStation);

        pricingMatrix.push({
          fromStationId: stations[i].id,
          toStationId: stations[j].id,
          price,
          stationCount,
        });
      }
    }

    return pricingMatrix;
  }

  /**
   * Validate pricing rule configuration
   */
  static validatePricingRuleConfig(type: PricingType, data: any): boolean {
    switch (type) {
      case PricingType.flat_rate:
        return !!data.basePrice;
      
      case PricingType.distance_based:
        return !!data.pricePerKm;
      
      case PricingType.station_based:
        return true; // Station pricing is set separately
      
      case PricingType.time_based:
        return !!(
          data.basePrice &&
          data.peakMultiplier &&
          data.peakStartTime &&
          data.peakEndTime
        );
      
      case PricingType.dynamic:
        return !!data.basePrice;
      
      default:
        return false;
    }
  }

  /**
   * Calculate distance between two GPS coordinates
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calculate route distance from stations
   */
  static async calculateRouteDistance(
    prisma: PrismaClient,
    routeId: string
  ): Promise<number> {
    const stations = await prisma.station.findMany({
      where: {
        routeId,
        deletedAt: null,
      },
      orderBy: { sequence: 'asc' },
    });

    if (stations.length < 2) {
      return 0;
    }

    let totalDistance = 0;

    for (let i = 0; i < stations.length - 1; i++) {
      const current = stations[i];
      const next = stations[i + 1];

      if (
        current.latitude &&
        current.longitude &&
        next.latitude &&
        next.longitude
      ) {
        const distance = this.calculateDistance(
          Number(current.latitude),
          Number(current.longitude),
          Number(next.latitude),
          Number(next.longitude)
        );
        totalDistance += distance;
      }
    }

    return totalDistance;
  }

  /**
   * Get active pricing rule for a specific scenario
   */
  static async getActivePricingRule(
    prisma: PrismaClient,
    tenantId: string,
    routeId?: string,
    tripDateTime?: Date
  ) {
    const now = tripDateTime || new Date();
    const dayOfWeek = now.getDay();

    return prisma.pricingRule.findFirst({
      where: {
        tenantId,
        status: PricingStatus.active,
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
          where: routeId ? { routeId, deletedAt: null } : undefined,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { isDefault: 'desc' },
      ],
    });
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = 'EGP'): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Check if discount is valid for use
   */
  static isDiscountValid(discount: any): {
    valid: boolean;
    reason?: string;
  } {
    const now = new Date();

    if (!discount.isActive) {
      return { valid: false, reason: 'Discount is not active' };
    }

    if (discount.validFrom > now) {
      return { valid: false, reason: 'Discount not yet valid' };
    }

    if (discount.validUntil < now) {
      return { valid: false, reason: 'Discount has expired' };
    }

    if (
      discount.usageLimit &&
      discount.usageCount >= discount.usageLimit
    ) {
      return { valid: false, reason: 'Discount usage limit reached' };
    }

    return { valid: true };
  }

  /**
   * Generate unique discount code
   */
  static generateDiscountCode(prefix: string = 'DISC'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Calculate occupancy rate for dynamic pricing
   */
  static calculateOccupancyRate(
    totalSeats: number,
    availableSeats: number
  ): number {
    if (totalSeats <= 0) return 0;
    const occupiedSeats = totalSeats - availableSeats;
    return (occupiedSeats / totalSeats) * 100;
  }

  /**
   * Get demand multiplier based on occupancy
   */
  static getDemandMultiplier(occupancyRate: number): number {
    if (occupancyRate >= 80) return 1.5; // High demand
    if (occupancyRate >= 60) return 1.3; // Medium-high demand
    if (occupancyRate >= 40) return 1.1; // Medium demand
    return 1.0; // Normal demand
  }

  /**
   * Check if time falls within peak hours
   */
  static isPeakHour(
    time: Date,
    peakStartTime: string,
    peakEndTime: string
  ): boolean {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const [startHour, startMin] = peakStartTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;

    const [endHour, endMin] = peakEndTime.split(':').map(Number);
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Peak hours cross midnight
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  /**
   * Bulk update trip pricing for a route
   */
  static async bulkUpdateTripPricing(
    prisma: PrismaClient,
    routeId: string,
    pricingRuleId: string
  ) {
    const trips = await prisma.trip.findMany({
      where: {
        routeId,
        status: { in: ['scheduled', 'boarding'] },
        deletedAt: null,
      },
    });

    const results = [];

    for (const trip of trips) {
      try {
        // This would call the pricing calculator
        // For now, we'll just mark them for update
        results.push({
          tripId: trip.id,
          status: 'pending_update',
        });
      } catch (error) {
        results.push({
          tripId: trip.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get pricing statistics for a tenant
   */
  static async getPricingStatistics(
    prisma: PrismaClient,
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalBookings,
      avgPrice,
      totalRevenue,
      discountUsage,
    ] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.aggregate({
        where,
        _avg: { finalPrice: true },
      }),
      prisma.booking.aggregate({
        where,
        _sum: { finalPrice: true },
      }),
      prisma.bookingDiscount.count({
        where: {
          booking: { tenantId },
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalBookings,
      averagePrice: avgPrice._avg.finalPrice || 0,
      totalRevenue: totalRevenue._sum.finalPrice || 0,
      discountUsageCount: discountUsage,
      discountUsageRate: totalBookings > 0 
        ? (discountUsage / totalBookings) * 100 
        : 0,
    };
  }
}