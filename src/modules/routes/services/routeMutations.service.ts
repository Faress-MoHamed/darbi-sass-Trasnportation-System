import { PrismaClient } from "@prisma/client";
import type {
	CreateRoute,
	UpdateRoute,
	AddStationToRoute,
	ReorderStations,
} from "../route.type";
import { distanceService } from "../../../services/distance.service";
import { AppError } from "../../../errors/AppError";
import { StationService } from "../../stations/stations.service";
import { RouteHelperService } from "../services/routeHelper.service";

// Constants
const INITIAL_SEQUENCE = 1;

export class RouteMutationsService {
	private prisma: PrismaClient;
	private RouteHelper: RouteHelperService;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("Prisma client instance is required", 500);
		}
		this.prisma = prisma;
		this.RouteHelper = new RouteHelperService(prisma, distanceService);
	}
	/**
	 * Create or update a route based on whether ID is provided
	 */
	async createOrUpdateRoute(data: CreateRoute, id?: string) {
		return id ? this.updateRoute(id, data) : this.createRoute(data);
	}

	/**
	 * Create a new route with stations
	 */
	async createRoute(data: CreateRoute) {
		// Validate route name uniqueness
		await this.RouteHelper.validateRouteNameUniqueness(
			data.name,
			data.tenantId
		);
		// Fetch and validate stations
		const stations = await new StationService(this.prisma).getStationsByIds(
			data.stations || []
		);

		// Calculate distance if we have enough stations
		const distanceKm = this.RouteHelper.calculateRouteDistance(
			stations,
			data.distanceKm
		);

		const route = await this.prisma.route.create({
			data: {
				tenantId: data.tenantId,
				name: data.name,
				distanceKm,
				estimatedTime: data.estimatedTime,
				active: data.active ?? true,
				stations: {
					connect: data.stations?.map((id) => ({ id })) || [],
				},
			},
			include: {
				stations: {
					orderBy: { sequence: "asc" as const },
				},
			},
		});

		return route;
	}

	/**
	 * Update an existing route
	 */
	async updateRoute(routeId: string, data: UpdateRoute) {
		await this.RouteHelper.ensureRouteExists(routeId);

		return await this.prisma.route.update({
			where: { id: routeId },
			data,
			include: {
				stations: {
					orderBy: { sequence: "asc" as const },
				},
			},
		});
	}

	/**
	 * Soft delete route by deactivating it
	 */
	async deactivateRoute(routeId: string) {
		return await this.RouteHelper.updateRouteStatus(routeId, false);
	}

	/**
	 * Activate a route
	 */
	async activateRoute(routeId: string) {
		return await this.RouteHelper.updateRouteStatus(routeId, true);
	}

	/**
	 * Toggle route active status
	 */
	async toggleRouteStatus(routeId: string) {
		const route = await this.RouteHelper.ensureRouteExists(routeId);
		return await this.RouteHelper.updateRouteStatus(routeId, !route.active);
	}

	/**
	 * Permanently delete a route
	 */
	async deleteRoute(routeId: string) {
		await this.RouteHelper.ensureRouteExists(routeId);

		return await this.prisma.route.delete({
			where: { id: routeId },
		});
	}

	/**
	 * Add a new station to an existing route
	 */
	async addStationToRoute(routeId: string, stationData: AddStationToRoute) {
		await this.RouteHelper.ensureRouteExists(routeId);

		const sequence = await this.RouteHelper.getNextSequenceNumber(
			routeId,
			stationData.sequence
		);

		const station = await this.prisma.station.create({
			data: {
				tenantId: stationData.tenantId,
				routeId,
				name: stationData.name,
				latitude: stationData.latitude,
				longitude: stationData.longitude,
				sequence,
			},
		});

		// Update route distance
		await this.RouteHelper.recalculateRouteDistance(routeId);

		return station;
	}

	/**
	 * Reorder stations manually
	 */
	async reorderStations(routeId: string, data: ReorderStations) {
		await this.RouteHelper.ensureRouteExists(routeId);

		// Update all station sequences in a transaction
		await this.prisma.$transaction(
			data.stationOrder.map(({ stationId, sequence }) =>
				this.prisma.station.update({
					where: { id: stationId },
					data: { sequence },
				})
			)
		);

		// Update route distance
		await this.RouteHelper.recalculateRouteDistance(routeId);

		return await this.RouteHelper.getRouteStations(routeId);
	}

	/**
	 * Automatically reorder stations by geographic proximity
	 */
	async reorderStationsByProximity(routeId: string) {
		const stations = await this.RouteHelper.getRouteStations(routeId);

		if (stations.length < 2) {
			return stations;
		}

		const orderedStations = distanceService.orderStationsByProximity(stations);

		// Update sequences in transaction
		await this.prisma.$transaction(
			orderedStations.map((station, index) =>
				this.prisma.station.update({
					where: { id: station.id },
					data: { sequence: index + INITIAL_SEQUENCE },
				})
			)
		);

		// Update route distance
		const totalDistance =
			distanceService.calculateTotalRouteDistance(orderedStations);

		await this.RouteHelper.updateRouteDistance(routeId, totalDistance);

		return orderedStations;
	}
}
