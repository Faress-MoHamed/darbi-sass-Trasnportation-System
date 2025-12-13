import { PrismaClient, BookingStatus } from "@prisma/client";
import { BookingRepository } from "./booking.repository";
import { AppError } from "../../errors/AppError";

interface CreateBookingDTO {
	tenantId: string;
	passengerId: string;
	tripId: string;
	seatNumber?: string;
	paymentMethodId?: string;
	customFieldValues?: Array<{ customFieldId: number; value: string }>;
}

interface BookingSearchParams {
	tenantId: string;
	passengerId?: string;
	tripId?: string;
	status?: BookingStatus;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

export class BookingService {
	private repository: BookingRepository;
	private prisma: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("PrismaClient instance is required");
		}
		this.prisma = prisma;
		this.repository = new BookingRepository(prisma);
	}

	async createBooking(dto: CreateBookingDTO) {
		const { tenantId, passengerId, tripId, seatNumber, customFieldValues } = dto;

		const trip = await this.validateTrip(tripId, tenantId);
		await this.checkDuplicateBooking(passengerId, tripId, tenantId);

		if (seatNumber) {
			await this.checkSeatAvailability(tripId, seatNumber, tenantId);
		}

		await this.checkTripCapacity(tripId, tenantId, trip.availableSeats);

		const ticketNumber = await this.repository.generateTicketNumber(tenantId);

		const booking = await this.repository.create({
			tenant: { connect: { id: tenantId } },
			passenger: { connect: { id: passengerId } },
			trip: { connect: { id: tripId } },
			seatNumber,
			ticketNumber,
			bookingDate: new Date(),
			status: "pending",
		});

		if (customFieldValues?.length) {
			await this.addCustomFieldValues(booking.id, customFieldValues);
		}

		if (trip.availableSeats !== null) {
			await this.prisma.trip.update({
				where: { id: tripId },
				data: { availableSeats: trip.availableSeats - 1 },
			});
		}

		return booking;
	}

	async getBooking(bookingId: string, tenantId: string, passengerId?: string) {
		const booking = await this.repository.findById(bookingId, tenantId);

		if (!booking) {
			throw new Error("Booking not found");
		}

		if (passengerId && booking.passengerId !== passengerId) {
			throw new Error("Unauthorized to view this booking");
		}

		return booking;
	}

	async searchBookings(params: BookingSearchParams) {
		const { page = 1, limit = 20, ...filters } = params;
		const skip = (page - 1) * limit;

		const result = await this.repository.findMany({
			...filters,
			skip,
			take: limit,
		});

		return {
			bookings: result.bookings,
			pagination: {
				page,
				limit,
				total: result.total,
				totalPages: Math.ceil(result.total / limit),
			},
		};
	}

	async getUserBookings(
		passengerId: string,
		tenantId: string,
		params?: {
			status?: BookingStatus;
			page?: number;
			limit?: number;
		}
	) {
		const { page = 1, limit = 20, status } = params || {};
		const skip = (page - 1) * limit;

		return this.repository.getUserBookings(passengerId, tenantId, {
			status,
			skip,
			take: limit,
		});
	}

	async getUpcomingBookings(
		passengerId: string,
		tenantId: string,
		limit: number = 5
	) {
		return this.repository.getUpcomingBookings(passengerId, tenantId, limit);
	}

	async getAvailableSeats(tripId: string, tenantId: string) {
		const trip = await this.prisma.trip.findFirst({
			where: { id: tripId, tenantId, deletedAt: null },
			include: { bus: true },
		});

		if (!trip) {
			throw new Error("Trip not found");
		}

		const bookedSeats = await this.repository.getBookedSeats(tripId, tenantId);
		const totalSeats = trip.bus?.capacity || trip.availableSeats || 0;

		return {
			totalSeats,
			bookedSeats: bookedSeats.length,
			availableSeats: totalSeats - bookedSeats.length,
			bookedSeatNumbers: bookedSeats,
		};
	}

	async verifyTicket(ticketNumber: string, tenantId: string) {
		const booking = await this.repository.findByTicketNumber(
			ticketNumber,
			tenantId
		);

		if (!booking) {
			return { valid: false, message: "Ticket not found" };
		}

		if (booking.status === "cancelled") {
			return { valid: false, message: "Ticket has been cancelled" };
		}

		if (booking.status !== "confirmed") {
			return { valid: false, message: "Ticket is not confirmed" };
		}

		if (
			booking.trip?.departureTime &&
			booking.trip.departureTime < new Date()
		) {
			return { valid: false, message: "Trip has already departed" };
		}

		return {
			valid: true,
			booking,
			message: "Ticket is valid",
		};
	}

	async checkInPassenger(bookingId: string, passengerId: string) {
		const booking = await this.repository.findById(bookingId, passengerId);

		if (!booking) {
			throw new Error("Booking not found");
		}

		if (booking.status !== "confirmed") {
			throw new Error("Only confirmed bookings can be checked in");
		}

		return booking;
	}

	private async validateTrip(tripId: string, tenantId: string) {
		const trip = await this.prisma.trip.findFirst({
			where: {
				id: tripId,
				tenantId,
				deletedAt: null,
			},
		});

		if (!trip) {
			throw new Error("Trip not found");
		}

		if (trip.status === "cancelled") {
			throw new Error("Cannot book a cancelled trip");
		}

		if (trip.status === "completed") {
			throw new Error("Cannot book a completed trip");
		}

		if (trip.departureTime && trip.departureTime < new Date()) {
			throw new Error("Cannot book a trip that has already departed");
		}

		return trip;
	}

	private async checkDuplicateBooking(
		passengerId: string,
		tripId: string,
		tenantId: string
	) {
		const hasDuplicate = await this.repository.hasDuplicateBooking(
			passengerId,
			tripId,
			tenantId
		);

		if (hasDuplicate) {
			throw new Error("You already have a booking for this trip");
		}
	}

	private async checkSeatAvailability(
		tripId: string,
		seatNumber: string,
		tenantId: string
	) {
		const isAvailable = await this.repository.isSeatAvailable(
			tripId,
			seatNumber,
			tenantId
		);

		if (!isAvailable) {
			throw new Error(`Seat ${seatNumber} is already booked`);
		}
	}

	private async checkTripCapacity(
		tripId: string,
		tenantId: string,
		availableSeats: number | null
	) {
		const confirmedBookings = await this.repository.countTripBookings(
			tripId,
			tenantId,
			"confirmed"
		);

		if (availableSeats !== null && confirmedBookings >= availableSeats) {
			throw new Error("Trip is fully booked");
		}
	}

	private async addCustomFieldValues(
		bookingId: string,
		values: Array<{ customFieldId: number; value: string }>
	) {
		const createData = values.map((v) => ({
			bookingId,
			customFieldId: v.customFieldId,
			value: v.value,
		}));

		await this.prisma.bookingCustomFieldValue.createMany({
			data: createData,
		});
	}
}
