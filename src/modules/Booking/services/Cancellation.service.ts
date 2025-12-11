import { PrismaClient } from "@prisma/client";
import { BookingRepository } from "../booking.repository";
import { PaymentService } from "./Payment.service";
import { AppError } from "../../../errors/AppError";

export class CancellationService {
	private bookingRepository: BookingRepository;
	private paymentService: PaymentService;
	private prisma: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("PrismaClient instance is required");
    }
    this.prisma = prisma;
		this.bookingRepository = new BookingRepository(prisma);
		this.paymentService = new PaymentService(prisma);
	}

	async cancelBooking(bookingId: string, tenantId: string, userId?: string) {
		const booking = await this.bookingRepository.findById(bookingId, tenantId);

		if (!booking) {
			throw new AppError("Booking not found");
		}

		this.validateCancellationPermission(booking, userId);
		this.validateCancellationStatus(booking);
		this.validateCancellationPolicy(booking);

		if (booking.paymentId) {
			await this.paymentService.processRefund(bookingId, tenantId);
		}

		await this.bookingRepository.cancel(bookingId, tenantId);
		await this.restoreTripCapacity(booking);

		return booking;
	}

	async bulkCancelBookings(bookingIds: string[], tenantId: string) {
		const bookings = await Promise.all(
			bookingIds.map((id) => this.cancelBooking(id, tenantId))
		);

		return bookings;
	}

	private validateCancellationPermission(booking: any, userId?: string) {
		if (userId && booking.userId !== userId) {
			throw new AppError("Unauthorized to cancel this booking");
		}
	}

	private validateCancellationStatus(booking: any) {
		if (booking.status === "cancelled") {
			throw new AppError("Booking is already cancelled");
		}
	}

	private validateCancellationPolicy(booking: any) {
		if (booking.status === "confirmed" && booking.trip?.departureTime) {
			const hoursUntilDeparture =
				(booking.trip.departureTime.getTime() - Date.now()) / (1000 * 60 * 60);

			if (hoursUntilDeparture < 2) {
				throw new AppError("Cannot cancel booking within 2 hours of departure");
			}
		}
	}

	private async restoreTripCapacity(booking: any) {
		if (booking.trip && booking.trip.availableSeats !== null) {
			await this.prisma.trip.update({
				where: { id: booking.tripId! },
				data: {
					availableSeats: booking.trip.availableSeats + 1,
				},
			});
		}
	}
}
