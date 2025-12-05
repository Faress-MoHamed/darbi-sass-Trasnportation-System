import { PrismaClient, Station, Prisma } from "@prisma/client";
import { paginate, type PaginationArgs } from "../../helpers/pagination";
import { AppError } from "../../errors/AppError";
import type { CreateStationType } from "./dto/CreateStation.dto";
import type { UpdateStationType } from "./dto/UpdateStation.dto";
import { PaginatedAndFilterService } from "../../services/Filters.service";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface StationFilters {
	routeId?: string;
	name?: string;
}

export interface PaginationOptions {
	page?: number;
	limit?: number;
	orderBy?: "name" | "sequence" | "createdAt";
	orderDirection?: "asc" | "desc";
}

// ============================================================================
// Station Service
// ============================================================================

export class StationService {
	prisma: PrismaClient;

	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("Prisma client not available");
		}
		this.prisma = prisma;
	}
	/**
	 * Create a new station
	 */
	async createStation(data: CreateStationType): Promise<Station> {
		try {
			await this.validateOnCreateStation(data);
			// Create station
			const station = await this.prisma.station.create({
				data: {
					name: data.name,
					latitude: data.latitude ? new Prisma.Decimal(data.latitude) : null,
					longitude: data.longitude ? new Prisma.Decimal(data.longitude) : null,
					routeId: data.routeId || null,
					sequence: data.sequence,
					tenantId: data.tenantId,
				},
				include: {
					route: true,
					tenant: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			return station;
		} catch (error: any) {
			throw new AppError(`${error.message || "Failed to create station"}`);
		}
	}

	/**
	 * Get station by ID
	 */
	async getStationById(
		id: string,
		NoTripsIncluded?: number
	): Promise<Station | null> {
		try {
			if (!id) {
				throw new AppError("Station ID is required", 400);
			}
			const station = await this.prisma.station.findFirst({
				where: {
					id,
				},
				include: {
					route: true,
					tripStations: {
						include: {
							trip: {
								select: {
									id: true,
									status: true,
									departureTime: true,
									arrivalTime: true,
								},
							},
						},
						orderBy: {
							scheduledArrivalTime: "desc",
						},
						take: NoTripsIncluded ? 0 : 5,
					},
				},
			});

			return station;
		} catch (error: any) {
			throw new AppError(`Failed to get station: ${error.message}`);
		}
	}

	/**
	 * Get all stations with filters and pagination
	 */
	async getStations(args: {
		id?: string;
		meta?: PaginationArgs;
		filters?: StationFilters;
	}) {
		try {
			const stationServiceWithPaginated =
				new PaginatedAndFilterService<Station>(this.prisma.station, [
					"name",
					"id",
					"routeId",
				]);

			return stationServiceWithPaginated.filterAndPaginate({
				...args?.meta,
				where: { ...args?.filters, id: args?.id },
			});
		} catch (error: any) {
			throw new AppError(`Failed to get stations: ${error.message}`);
		}
	}

	/**
	 * Get stations by route ID
	 */
	async getStationsByRoute(routeId: string): Promise<Station[]> {
		try {
			const stations = await this.prisma.station.findMany({
				where: {
					routeId,
				},
				orderBy: {
					sequence: "asc",
				},
			});

			return stations;
		} catch (error: any) {
			throw new AppError(`Failed to get stations by route: ${error.message}`);
		}
	}

	/**
	 * Update station
	 */
	async updateStation(id: string, data: UpdateStationType): Promise<Station> {
		try {
			// Verify station exists and belongs to tenant
			const existingStation = await this.prisma.station.findFirst({
				where: { id },
			});

			if (!existingStation) {
				throw new AppError(
					`Station with ID ${id} not found or doesn't belong to tenant`
				);
			}

			// If routeId is being updated, validate it
			if (data.routeId) {
				const route = await this.prisma.route.findFirst({
					where: {
						id: data.routeId,
					},
				});

				if (!route) {
					throw new AppError(
						`Route with ID ${data.routeId} not found or doesn't belong to tenant`
					);
				}
			}

			// Update station
			const updatedStation = await this.prisma.station.update({
				where: { id },
				data: {
					name: data.name,
					latitude:
						data.latitude !== undefined
							? data.latitude !== null
								? new Prisma.Decimal(data.latitude)
								: null
							: undefined,
					longitude:
						data.longitude !== undefined
							? data.longitude !== null
								? new Prisma.Decimal(data.longitude)
								: null
							: undefined,
					routeId: data.routeId,
					sequence: data.sequence,
				},
				include: {
					route: true,
				},
			});

			return updatedStation;
		} catch (error: any) {
			throw new AppError(`Failed to update station: ${error.message}`);
		}
	}

	/**
	 * Delete station
	 */
	async deleteStation(id: string): Promise<void> {
		try {
			// Verify station exists and belongs to tenant
			const station = await this.prisma.station.findFirst({
				where: { id },
			});

			if (!station) {
				throw new AppError(
					`Station with ID ${id} not found or doesn't belong to tenant`
				);
			}

			// Check if station is used in any trips
			const tripStations = await this.prisma.tripStation.count({
				where: { stationId: id },
			});

			if (tripStations > 0) {
				throw new AppError(
					`Cannot delete station: it is referenced by ${tripStations} trip(s)`
				);
			}

			// Delete station
			await this.prisma.station.delete({
				where: { id },
			});
		} catch (error: any) {
			throw new AppError(`Failed to delete station: ${error.message}`);
		}
	}

	/**
	 * Bulk create stations
	 */
	async CreateMultipleStations(stations: CreateStationType[]): Promise<number> {
		try {
			const Savedstations = await this.prisma.station.findMany();
			const data = await stations.map(async (s) => {
				if (
					Savedstations.find(
						(ss) => ss.name === s.name && ss.tenantId === s.tenantId
					)
				) {
					throw new AppError(
						`Station with name ${s.name} already exists for this tenant`,
						409
					);
				}

				if (
					Savedstations.find(
						(el) =>
							Number(el?.latitude) === s.latitude &&
							Number(el?.longitude) === s.longitude &&
							el.tenantId === s.tenantId
					)
				) {
					throw new AppError(
						`Station with latitude ${s.latitude} and longitude ${s.longitude} already exists for this tenant`,
						409
					);
				}
				const haveNearStation = this.getStationsNearLocation(
					s.latitude!,
					s.longitude!
				);
				if (await haveNearStation) {
					throw new AppError(
						`A station already exists near the provided location (latitude: ${s.latitude}, longitude: ${s.longitude})`,
						409
					);
				}
				return {
					tenantId: s.tenantId,
					name: s.name,
					latitude: s.latitude ? new Prisma.Decimal(s.latitude) : null,
					longitude: s.longitude ? new Prisma.Decimal(s.longitude) : null,
					routeId: s.routeId,
					sequence: s.sequence,
				};
			});
			const result = await this.prisma.station.createMany({
				data: await Promise.all(data),
				skipDuplicates: true,
			});

			return result.count;
		} catch (error: any) {
			throw new AppError(
				`${error.message || "Failed to bulk create stations"}`
			);
		}
	}

	/**
	 * Reorder stations in a route
	 */
	async reorderStations(
		routeId: string,
		stationOrder: { stationId: string; sequence: number }[]
	): Promise<void> {
		try {
			// Verify route exists and belongs to tenant
			const route = await this.prisma.route.findFirst({
				where: { id: routeId },
			});

			if (!route) {
				throw new AppError(
					`Route with ID ${routeId} not found or doesn't belong to tenant`
				);
			}

			// Update each station's sequence
			await this.prisma.$transaction(
				stationOrder.map(({ stationId, sequence }) =>
					this.prisma.station.update({
						where: { id: stationId },
						data: { sequence },
					})
				)
			);
		} catch (error: any) {
			throw new AppError(`Failed to reorder stations: ${error.message}`);
		}
	}

	/**
	 * Get stations near a location (within radius in km)
	 */
	async getStationsNearLocation(
		latitude: number,
		longitude: number,
		radiusKm: number = 5
	): Promise<Station[]> {
		try {
			// Using Haversine formula approximation
			// Note: For production, consider using PostGIS for accurate geospatial queries
			const stations = await this.prisma.$queryRaw<Station[]>`
        SELECT *
        FROM stations
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians(${latitude})) * 
              cos(radians(latitude::float)) * 
              cos(radians(longitude::float) - radians(${longitude})) + 
              sin(radians(${latitude})) * 
              sin(radians(latitude::float))
            )
          ) <= ${radiusKm}
        ORDER BY (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(latitude::float)) * 
            cos(radians(longitude::float) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(latitude::float))
          )
        ) ASC
      `;

			return stations;
		} catch (error: any) {
			throw new AppError(`Failed to get nearby stations: ${error.message}`);
		}
	}

	private async validateOnCreateStation(data: CreateStationType) {
		// If routeId provided, validate it exists and belongs to the tenant
		if (data.routeId) {
			const route = await this.prisma.route.findFirst({
				where: {
					id: data.routeId,
				},
			});

			if (!route) {
				throw new AppError(
					`Route with ID ${data.routeId} not found or doesn't belong to tenant`
				);
			}
		}
		const stations = await this.prisma.station.findMany();
		if (
			stations.find((s) => s.name === data.name && s.tenantId === data.tenantId)
		) {
			throw new AppError(
				`Station with name ${data.name} already exists for this tenant`,
				409
			);
		}

		if (
			stations.find(
				(el) =>
					Number(el?.latitude) === data.latitude &&
					Number(el?.longitude) === data.longitude &&
					el.tenantId === data.tenantId
			)
		) {
			throw new AppError(
				`Station with latitude ${data.latitude} and longitude ${data.longitude} already exists for this tenant`,
				409
			);
		}
		const haveNearStation = await this.getStationsNearLocation(
			data.latitude!,
			data.longitude!
		);
		if (haveNearStation) {
			throw new AppError(
				`A station already exists near the provided location (latitude: ${data.latitude}, longitude: ${data.longitude})`,
				409
			);
		}
	}
}
