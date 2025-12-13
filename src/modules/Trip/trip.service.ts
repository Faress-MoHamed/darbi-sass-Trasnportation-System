import { PrismaClient, TripStatus, Trip } from "@prisma/client";
import { TripRepository } from "./trip.repository";
import { AppError } from "../../errors/AppError";
import { BusService } from "../buses/buses.service";
import { DriverService } from "../drivers/drivers.service";
import { RoutesQueriesService } from "../routes/services/routesQueries.service";
import {
	calculateArrivalTime,
	getTripEstimatedTimeDetails,
} from "./utils/getTripEstimationTime";

interface CreateTripInput {
	tenantId: string;
	routeId: string;
	busId: string;
	driverId: string;
	departureTime: Date;
	arrivalTime?: Date;
	status?: TripStatus;
	notes?: string;
	stations?: {
		stationId: string;
		scheduledArrivalTime: Date;
	}[];
}

interface UpdateTripInput {
	routeId?: string;
	busId?: string;
	driverId?: string;
	departureTime?: Date;
	arrivalTime?: Date;
	status?: TripStatus;
	availableSeats?: number;
	notes?: string;
}

export interface TripFilters {
	status?: TripStatus;
	routeId?: string;
	busId?: string;
	driverId?: string;
	startDate?: Date;
	endDate?: Date;
}

export class TripService {
	private repository: TripRepository;
	private bus: BusService;
	private driver: DriverService;
	private route: RoutesQueriesService;
	private prisma: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("PrismaClient instance is required");
		}
		this.repository = new TripRepository(prisma);
		this.prisma = prisma;
		this.bus = new BusService(prisma);
		this.driver = new DriverService(prisma);
		this.route = new RoutesQueriesService(prisma);
	}

	async createTrip(input: CreateTripInput) {
		// Validate bus exists and is active
		let arrivalTime = input.arrivalTime || null;

		const bus = await this.bus.getBusById(input.busId);

		if (!bus) {
			throw new AppError("Bus not found or not active", 404);
		}

		// Validate driver exists and is available
		const driver = await this.driver.getDriverById(input.driverId);

		if (!driver) {
			throw new AppError("Driver not found", 404);
		}
		// Validate route exists
		const route = await this.route.getRouteById(input.routeId);

		if (!route) {
			throw new AppError("Route not found", 404);
		}
		if (!arrivalTime) {
			arrivalTime = await calculateArrivalTime(
				input.routeId,
				input.departureTime
			);
		}
		if (arrivalTime && arrivalTime <= input.departureTime) {
			throw new AppError("Arrival time must be after departure time", 400);
		}

		// Check driver availability
		const driverAvailable = await this.repository.checkDriverAvailability(
			input.driverId,
			input.departureTime,
			arrivalTime!
		);

		if (!driverAvailable) {
			throw new AppError("Driver is not available for the specified time", 400);
		}

		// Check bus availability
		const busAvailable = await this.repository.checkBusAvailability(
			input.busId,
			input.departureTime,
			arrivalTime!
		);

		if (!busAvailable) {
			throw new AppError("Bus is not available for the specified time", 400);
		}
		return await this.prisma.$transaction(async (tx) => {
			const trip = await this.repository.create(
				{
					tenant: { connect: { id: input.tenantId } },
					route: { connect: { id: input.routeId } },
					bus: { connect: { id: input.busId } },
					driver: { connect: { id: input.driverId } },
					departureTime: input.departureTime,
					arrivalTime: arrivalTime,
					status: input.status || "scheduled",
					availableSeats: bus.capacity || 0,
					notes: input.notes,
				},
				tx
			);

			if (input.stations?.length) {
				await tx.tripStation.createMany({
					data: input.stations.map((s) => ({
						tripId: trip.id,
						stationId: s.stationId,
						scheduledArrivalTime: s.scheduledArrivalTime,
					})),
				});
			}

			return trip;
		});
	}

	async updateTrip(tripId: string, input: UpdateTripInput): Promise<Trip> {
		const trip = await this.repository.findById(tripId);

		if (!trip) {
			throw new AppError("Trip not found", 404);
		}

		// If updating driver, check availability
		if (input.driverId && input.driverId !== trip.driverId) {
			const departureTime = input.departureTime || trip.departureTime!;
			const arrivalTime = input.arrivalTime || trip.arrivalTime!;

			const driverAvailable = await this.repository.checkDriverAvailability(
				input.driverId,
				departureTime,
				arrivalTime,
				tripId
			);

			if (!driverAvailable) {
				throw new AppError(
					"Driver is not available for the specified time",
					400
				);
			}
		}

		// If updating bus, check availability
		if (input.busId && input.busId !== trip.busId) {
			const departureTime = input.departureTime || trip.departureTime!;
			const arrivalTime = input.arrivalTime || trip.arrivalTime!;

			const busAvailable = await this.repository.checkBusAvailability(
				input.busId,
				departureTime,
				arrivalTime,
				tripId
			);

			if (!busAvailable) {
				throw new AppError("Bus is not available for the specified time", 400);
			}
		}

		return this.repository.update(tripId, input);
	}

	async getTripById(tripId: string): Promise<Trip> {
		const trip = await this.repository.findById(tripId);

		if (!trip) {
			throw new AppError("Trip not found", 404);
		}

		return trip;
	}

	async getTripsByTenant(
		tenantId: string,
		filters?: TripFilters,
		pagination?: { skip?: number; take?: number }
	) {
		return this.repository.findByTenantId(tenantId, filters, pagination);
	}

	async updateTripStatus(tripId: string, status: TripStatus): Promise<Trip> {
		const trip = await this.repository.findById(tripId);

		if (!trip) {
			throw new AppError("Trip not found", 404);
		}

		// Validate status transitions
		const validTransitions: Record<TripStatus, TripStatus[]> = {
			scheduled: ["boarding", "cancelled"],
			boarding: ["in_progress", "cancelled"],
			in_progress: ["delayed", "completed", "cancelled"],
			delayed: ["in_progress", "completed", "cancelled"],
			completed: [],
			cancelled: [],
		};

		if (!validTransitions[trip.status].includes(status)) {
			throw new AppError(
				`Cannot transition from ${trip.status} to ${status}`,
				400
			);
		}

		return this.repository.updateStatus(tripId, status);
	}

	async cancelTrip(tripId: string): Promise<Trip> {
		const trip = await this.repository.findById(tripId);

		if (!trip) {
			throw new AppError("Trip not found", 404);
		}

		if (trip.status === "completed" || trip.status === "cancelled") {
			throw new AppError(`Cannot cancel a ${trip.status} trip`, 400);
		}

		// Cancel all confirmed bookings
		await this.repository["prisma"].booking.updateMany({
			where: {
				tripId,
				status: "confirmed",
				deletedAt: null,
			},
			data: {
				status: "cancelled",
			},
		});

		return this.repository.updateStatus(tripId, "cancelled");
	}

	async deleteTrip(tripId: string): Promise<Trip> {
		const trip = await this.repository.findById(tripId);

		if (!trip) {
			throw new AppError("Trip not found", 404);
		}

		if (trip.status !== "scheduled" && trip.status !== "cancelled") {
			throw new AppError("Can only delete scheduled or cancelled trips", 400);
		}

		return this.repository.softDelete(tripId);
	}

	async getUpcomingTrips(
		tenantId: string,
		filters?: {
			routeId?: string;
			hours?: number;
		}
	) {
		return this.repository.findUpcomingTrips(tenantId, filters);
	}

	async getAvailableSeats(tripId: string): Promise<number> {
		return this.repository.getAvailableSeats(tripId);
	}

	async updateTripStationArrival(
		tripId: string,
		stationId: string,
		actualArrivalTime: Date
	) {
		const tripStation = await this.repository["prisma"].tripStation.findUnique({
			where: {
				tripId_stationId: {
					tripId,
					stationId,
				},
			},
		});

		if (!tripStation) {
			throw new AppError("Trip station not found", 404);
		}

		return this.repository["prisma"].tripStation.update({
			where: {
				tripId_stationId: {
					tripId,
					stationId,
				},
			},
			data: {
				actualArrivalTime,
			},
		});
	}

	async logTripLocation(
		tripId: string,
		data: {
			latitude: number;
			longitude: number;
			speed?: number;
			passengersCount?: number;
		}
	) {
		return this.repository["prisma"].tripLog.create({
			data: {
				tripId,
				busLocationLat: data.latitude,
				busLocationLng: data.longitude,
				speed: data.speed,
				passengersCount: data.passengersCount,
			},
		});
	}
}
