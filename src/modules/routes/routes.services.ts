import { PrismaClient, Route, Prisma, type Station } from "@prisma/client";
import { paginate, type PaginationArgs } from "../../helpers/pagination";
import type {
	CreateRoute,
	UpdateRoute,
	AddStationToRoute,
	ReorderStations,
	SearchRoutes,
	GetRoutesWithUpcomingTrips,
} from "./route.type";
import { distanceService } from "../../services/distance.service";

export class RouteService {
	private prisma: PrismaClient;

	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new Error("Prisma client instance is required");
		}
		this.prisma = prisma;
	}

	/**
	 * Reorder stations by proximity and update sequence
	 */
	async reorderStationsByProximity(routeId: string) {
		const stations = await this.prisma.station.findMany({
			where: { routeId },
		});

		const orderedStations = distanceService.orderStationsByProximity(stations);

		// Update sequence in database using transaction
		await this.prisma.$transaction(
			orderedStations.map((station, index) =>
				this.prisma.station.update({
					where: { id: station.id },
					data: { sequence: index + 1 },
				})
			)
		);

		// Calculate and update total route distance
		const totalDistance =
			distanceService.calculateTotalRouteDistance(orderedStations);

		await this.prisma.route.update({
			where: { id: routeId },
			data: { distanceKm: totalDistance },
		});

		return orderedStations;
	}

	/**
	 * Create a new route
	 */
	async createRoute(data: CreateRoute) {
		const stations = await this.prisma.station.findMany({
			where: {
				id: { in: data.stations || [] },
			},
		});
		let totalDistance = data.distanceKm;
		// Auto-calculate distance if stations are connected
		if (stations.length >= 2) {
			totalDistance = distanceService.calculateTotalRouteDistance(stations);
		}
		const route = await this.prisma.route.create({
			data: {
				tenantId: data.tenantId,
				name: data.name,
				distanceKm: totalDistance || 0,
				estimatedTime: data.estimatedTime,
				active: data.active ?? true,
				stations: {
					connect: data.stations?.map((stationId) => ({ id: stationId })) || [],
				},
			},
			include: {
				stations: {
					orderBy: {
						sequence: "asc",
					},
				},
			},
		});

		return route;
	}

	/**
	 * Get route by ID
	 */
	async getRouteById(routeId: string) {
		return await this.prisma.route.findFirst({
			where: {
				id: routeId,
			},
			include: {
				stations: {
					orderBy: {
						sequence: "asc",
					},
				},
				trips: {
					orderBy: {
						departureTime: "desc",
					},
					take: 10,
				},
				customFieldValues: {
					include: {
						customField: true,
					},
				},
			},
		});
	}

	/**
	 * Get all routes for a tenant
	 */
	async getRoutesByTenant(args: PaginationArgs) {
		const routes = await paginate(this.prisma.route, {
			...args,
		});

		return routes || [];
	}

	/**
	 * Update route
	 */
	async updateRoute(routeId: string, data: UpdateRoute) {
		return await this.prisma.route.update({
			where: {
				id: routeId,
			},
			data,
			include: {
				stations: {
					orderBy: {
						sequence: "asc",
					},
				},
			},
		});
	}

	/**
	 * Delete route (soft delete by setting active to false)
	 */
	async DisActivate(routeId: string) {
		return await this.prisma.route.update({
			where: {
				id: routeId,
			},
			data: {
				active: false,
			},
		});
	}

	/**
	 * Hard delete route
	 */
	async hardDeleteRoute(routeId: string) {
		return await this.prisma.route.delete({
			where: {
				id: routeId,
			},
		});
	}

	/**
	 * Add station to route
	 */
	async addStationToRoute(
		routeId: string,

		stationData: AddStationToRoute
	) {
		// Get the next sequence number if not provided
		let sequence = stationData.sequence;
		if (sequence === undefined) {
			const lastStation = await this.prisma.station.findFirst({
				where: { routeId },
				orderBy: { sequence: "desc" },
			});
			sequence = (lastStation?.sequence ?? 0) + 1;
		}

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

		// Recalculate route distance
		const stations = await this.prisma.station.findMany({
			where: { routeId },
			orderBy: { sequence: "asc" },
		});

		const totalDistance = distanceService.calculateTotalRouteDistance(stations);

		if (totalDistance > 0) {
			await this.prisma.route.update({
				where: { id: routeId },
				data: { distanceKm: totalDistance },
			});
		}

		return station;
	}

	/**
	 * Get route with active trips
	 */
	async getRouteWithActiveTrips(routeId: string) {
		return await this.prisma.route.findFirst({
			where: {
				id: routeId,
			},
			include: {
				stations: {
					orderBy: {
						sequence: "asc",
					},
				},
				trips: {
					where: {
						status: "active",
					},
					include: {
						bus: true,
						driver: {
							include: {
								user: {
									select: {
										name: true,
										phone: true,
									},
								},
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Search routes by name
	 */
	async searchRoutes(params: SearchRoutes) {
		const where: Prisma.RouteWhereInput = {
			name: {
				contains: params.searchTerm,
				mode: "insensitive",
			},
			...(params.active !== undefined && { active: params.active }),
		};

		const [routes, total] = await Promise.all([
			this.prisma.route.findMany({
				where,
				include: {
					stations: {
						orderBy: {
							sequence: "asc",
						},
					},
				},
				skip: params.skip,
				take: params.take,
				orderBy: {
					name: "asc",
				},
			}),
			this.prisma.route.count({ where }),
		]);

		return { routes, total };
	}

	/**
	 * Reorder stations in a route
	 */
	async reorderStations(
		routeId: string,

		data: ReorderStations
	) {
		// Verify route belongs to tenant
		const route = await this.prisma.route.findFirst({
			where: { id: routeId },
		});

		if (!route) {
			throw new Error("Route not found");
		}

		// Update stations in a transaction
		await this.prisma.$transaction(
			data.stationOrder.map(({ stationId, sequence }) =>
				this.prisma.station.update({
					where: { id: stationId },
					data: { sequence },
				})
			)
		);

		// Recalculate route distance
		const stations = await this.prisma.station.findMany({
			where: { routeId },
			orderBy: { sequence: "asc" },
		});

		const totalDistance = distanceService.calculateTotalRouteDistance(stations);

		if (totalDistance > 0) {
			await this.prisma.route.update({
				where: { id: routeId },
				data: { distanceKm: totalDistance },
			});
		}

		return stations;
	}

	/**
	 * Get routes with upcoming trips
	 */
	async getRoutesWithUpcomingTrips(params: GetRoutesWithUpcomingTrips) {
		const now = new Date();
		const futureTime = new Date(
			now.getTime() + params.hoursAhead * 60 * 60 * 1000
		);

		return await this.prisma.route.findMany({
			where: {
				active: true,
				trips: {
					some: {
						departureTime: {
							gte: now,
							lte: futureTime,
						},
						status: "active",
					},
				},
			},
			include: {
				trips: {
					where: {
						departureTime: {
							gte: now,
							lte: futureTime,
						},
						status: "active",
					},
					include: {
						bus: true,
						driver: {
							include: {
								user: {
									select: {
										name: true,
										phone: true,
									},
								},
							},
						},
					},
					orderBy: {
						departureTime: "asc",
					},
				},
				stations: {
					orderBy: {
						sequence: "asc",
					},
				},
			},
		});
	}

	/**
	 * Toggle route active status
	 */
	async toggleRouteStatus(routeId: string) {
		const route = await this.prisma.route.findFirst({
			where: { id: routeId },
		});

		if (!route) {
			throw new Error("Route not found");
		}

		return await this.prisma.route.update({
			where: { id: routeId },
			data: { active: !route.active },
		});
	}
}
