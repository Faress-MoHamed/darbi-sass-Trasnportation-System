import { Prisma, type PrismaClient, type Station } from "@prisma/client";
import { AppError } from "../../../errors/AppError";
import type { DistanceService } from "../../../services/distance.service";
import type { CreateStationType } from "../../stations/dto/CreateStation.dto";

export class RouteHelperService {
	constructor(
		private prisma: PrismaClient,
		private distanceService: DistanceService
	) {
		this.prisma = prisma;
		this.distanceService = distanceService;
	}

	// ========== Private Helper Methods ==========

	/**
	 * Validate that route name is unique for the tenant
	 */
	async validateRouteNameUniqueness(name: string, tenantId: string) {
		const existingRoute = await this.prisma.route.findFirst({
			where: { name, tenantId },
		});

		if (existingRoute) {
			throw new AppError("Route with this name already exists", 409);
		}
	}

	/**
	 * Ensure route exists, throw error if not
	 */
	async ensureRouteExists(routeId: string) {
		const route = await this.prisma.route.findUnique({
			where: { id: routeId },
		});

		if (!route) {
			throw new AppError("Route not found", 404);
		}

		return route;
	}

	/**
	 * Get all stations for a route, ordered by sequence
	 */
	async getRouteStations(routeId: string) {
		return await this.prisma.station.findMany({
			where: { routeId },
			orderBy: { sequence: "asc" },
		});
	}

	/**
	 * Calculate route distance from stations or use provided value
	 */
	calculateRouteDistance(
		stations: CreateStationType[],
		providedDistance?: number
	): number {
		if (stations.length >= 2) {
			return this.distanceService.calculateTotalRouteDistance(stations);
		}
		return providedDistance || 0;
	}

	/**
	 * Get the next sequence number for a new station
	 */
	async getNextSequenceNumber(
		routeId: string,
		providedSequence?: number
	): Promise<number> {
		if (providedSequence !== undefined) {
			return providedSequence;
		}

		const lastStation = await this.prisma.station.findFirst({
			where: { routeId },
			orderBy: { sequence: "desc" },
		});

		return (lastStation?.sequence ?? 0) + 1;
	}

	/**
	 * Recalculate and update route distance based on current stations
	 */
	async recalculateRouteDistance(routeId: string) {
		const stations = await this.getRouteStations(routeId);
		const totalDistance = this.distanceService.calculateTotalRouteDistance(
			stations?.map((s) => ({
				...s,
				latitude: new Prisma.Decimal(s.latitude ?? 0.0),
				longitude: new Prisma.Decimal(s.longitude ?? 0.0),
				routeId: s.routeId ?? undefined,
				sequence: s.sequence ?? undefined,
			}))
		);

		if (totalDistance > 0) {
			await this.updateRouteDistance(routeId, totalDistance);
		}
	}

	/**
	 * Update route distance
	 */
	async updateRouteDistance(routeId: string, distanceKm: number) {
		await this.prisma.route.update({
			where: { id: routeId },
			data: { distanceKm },
		});
	}

	/**
	 * Update route active status
	 */
	async updateRouteStatus(routeId: string, active: boolean) {
		return await this.prisma.route.update({
			where: { id: routeId },
			data: { active },
		});
	}
}
