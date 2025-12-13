import { PrismaClient, Trip, TripStatus, Prisma } from "@prisma/client";
import { AppError } from "../../errors/AppError";

export class TripRepository {
	constructor(private prisma: PrismaClient) {}

	async create(
		data: Prisma.TripCreateInput,
		prismaModel?: Prisma.TransactionClient | PrismaClient
	): Promise<Trip> {
		const prisma = prismaModel ?? this.prisma;

		return prisma.trip.create({
			data,
			include: {
				route: true,
				bus: true,
				driver: {
					include: {
						user: true,
					},
				},
				tripStations: {
					include: {
						station: true,
					},
					orderBy: {
						station: {
							sequence: "asc",
						},
					},
				},
			},
		});
	}

	async findById(id: string): Promise<Trip | null> {
		return this.prisma.trip.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			include: {
				route: true,
				bus: true,
				driver: {
					include: {
						user: true,
					},
				},
				tripStations: {
					include: {
						station: true,
					},
					orderBy: {
						station: {
							sequence: "asc",
						},
					},
				},
				bookings: {
					where: {
						deletedAt: null,
					},
				},
			},
		});
	}

	async findByTenantId(
		tenantId: string,
		filters?: {
			status?: TripStatus;
			routeId?: string;
			busId?: string;
			driverId?: string;
			startDate?: Date;
			endDate?: Date;
		},
		pagination?: { skip?: number; take?: number }
	) {
		const where: Prisma.TripWhereInput = {
			tenantId,
			deletedAt: null,
			...(filters?.status && { status: filters.status }),
			...(filters?.routeId && { routeId: filters.routeId }),
			...(filters?.busId && { busId: filters.busId }),
			...(filters?.driverId && { driverId: filters.driverId }),
			...(filters?.startDate &&
				filters?.endDate && {
					departureTime: {
						gte: filters.startDate,
						lte: filters.endDate,
					},
				}),
		};

		const [trips, total] = await Promise.all([
			this.prisma.trip.findMany({
				where,
				include: {
					route: true,
					bus: true,
					driver: {
						include: {
							user: true,
						},
					},
					tripStations: {
						include: {
							station: true,
						},
						orderBy: {
							station: {
								sequence: "asc",
							},
						},
					},
				},
				orderBy: {
					departureTime: "desc",
				},
				skip: pagination?.skip || 0,
				take: pagination?.take || 50,
			}),
			this.prisma.trip.count({ where }),
		]);

		return { trips, total };
	}

	async update(id: string, data: Prisma.TripUpdateInput): Promise<Trip> {
		return this.prisma.trip.update({
			where: { id },
			data,
			include: {
				route: true,
				bus: true,
				driver: {
					include: {
						user: true,
					},
				},
				tripStations: {
					include: {
						station: true,
					},
				},
			},
		});
	}

	async updateStatus(id: string, status: TripStatus): Promise<Trip> {
		return this.update(id, { status });
	}

	async softDelete(id: string): Promise<Trip> {
		return this.prisma.trip.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});
	}

	async getAvailableSeats(tripId: string): Promise<number> {
		const trip = await this.prisma.trip.findFirst({
			where: { id: tripId, deletedAt: null },
			include: {
				bus: true,
				bookings: {
					where: {
						status: "confirmed",
						deletedAt: null,
					},
				},
			},
		});

		if (!trip) {
			throw new AppError("Trip not found", 404);
		}

		const totalSeats = trip.bus?.capacity || 0;
		const bookedSeats = trip.bookings.length;

		return Math.max(0, totalSeats - bookedSeats);
	}

	async updateAvailableSeats(tripId: string): Promise<Trip> {
		const availableSeats = await this.getAvailableSeats(tripId);
		return this.update(tripId, { availableSeats });
	}

	async findUpcomingTrips(
		tenantId: string,
		filters?: {
			routeId?: string;
			hours?: number;
		}
	) {
		const now = new Date();
		const futureTime = new Date();
		futureTime.setHours(now.getHours() + (filters?.hours || 24));

		return this.prisma.trip.findMany({
			where: {
				tenantId,
				deletedAt: null,
				status: "scheduled",
				departureTime: {
					gte: now,
					lte: futureTime,
				},
				...(filters?.routeId && { routeId: filters.routeId }),
			},
			include: {
				route: true,
				bus: true,
				driver: {
					include: {
						user: true,
					},
				},
			},
			orderBy: {
				departureTime: "asc",
			},
		});
	}

	async checkDriverAvailability(
		driverId: string,
		departureTime: Date,
		arrivalTime: Date,
		excludeTripId?: string
	): Promise<boolean> {
		const conflictingTrips = await this.prisma.trip.findMany({
			where: {
				driverId,
				deletedAt: null,
				status: {
					in: ["scheduled", "boarding", "in_progress"],
				},
				...(excludeTripId && { id: { not: excludeTripId } }),
				OR: [
					{
						AND: [
							{ departureTime: { lte: departureTime } },
							{ arrivalTime: { gte: departureTime } },
						],
					},
					{
						AND: [
							{ departureTime: { lte: arrivalTime } },
							{ arrivalTime: { gte: arrivalTime } },
						],
					},
					{
						AND: [
							{ departureTime: { gte: departureTime } },
							{ arrivalTime: { lte: arrivalTime } },
						],
					},
				],
			},
		});

		return conflictingTrips.length === 0;
	}

	async checkBusAvailability(
		busId: string,
		departureTime: Date,
		arrivalTime: Date,
		excludeTripId?: string
	): Promise<boolean> {
		const conflictingTrips = await this.prisma.trip.findMany({
			where: {
				busId,
				deletedAt: null,
				status: {
					in: ["scheduled", "boarding", "in_progress"],
				},
				...(excludeTripId && { id: { not: excludeTripId } }),
				OR: [
					{
						AND: [
							{ departureTime: { lte: departureTime } },
							{ arrivalTime: { gte: departureTime } },
						],
					},
					{
						AND: [
							{ departureTime: { lte: arrivalTime } },
							{ arrivalTime: { gte: arrivalTime } },
						],
					},
					{
						AND: [
							{ departureTime: { gte: departureTime } },
							{ arrivalTime: { lte: arrivalTime } },
						],
					},
				],
			},
		});

		return conflictingTrips.length === 0;
	}
}
