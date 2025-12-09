import type { PrismaClient, TripStatus } from "@prisma/client";
import { AppError } from "../../../errors/AppError";
import type { PaginationArgs } from "../../../helpers/pagination";
import { PaginatedAndFilterService } from "../../../services/Filters.service";

export class RoutesQueriesService {
	private prisma: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("Prisma client instance is required", 500);
		}
		this.prisma = prisma;
	}
	async getAllRoutes(args: PaginationArgs) {
		return await new PaginatedAndFilterService(this.prisma.route, [
			"name",
		]).filterAndPaginate(args);
	}
	async getRouteById(routeId: string) {
		const route = await this.prisma.route.findUnique({
			where: { id: routeId },
			include: {
				stations: {
					orderBy: { sequence: "asc" as const },
				},
				trips: {
					orderBy: { departureTime: "desc" as const },
					take: 10,
				},
				customFieldValues: {
					include: {
						customField: true,
					},
				},
			},
		});

		if (!route) {
			throw new AppError("Route not found", 404);
		}

		return route;
	}
	async getRouteWithTrips(routeId: string, status?: TripStatus[]) {
		const route = await this.prisma.route.findUnique({
			where: { id: routeId },
			include: {
				stations: {
					orderBy: { sequence: "asc" as const },
				},
				trips: {
					where: status ? { status: { in: status } } : undefined,
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

		if (!route) {
			throw new AppError("Route not found", 404);
		}

		return route;
	}
}
