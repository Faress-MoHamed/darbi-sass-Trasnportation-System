import { BookingService } from "../../booking.service";
import { PaymentService } from "../../services/Payment.service";
import { CancellationService } from "../../services/Cancellation.service";
import { safeResolver } from "../../../../helpers/safeResolver";


export const bookingMutations = {
	createBooking: safeResolver(async (_: any, args: { input: any }, ctx) => {
		const bookingService = new BookingService(ctx.prisma);
		return bookingService.createBooking(args.input);
	}),

	processPayment: safeResolver(async (_: any, args: { input: any }, ctx) => {
		const paymentService = new PaymentService(ctx.prisma);

		return paymentService.processPayment(args.input);
	}),

	cancelBooking: safeResolver(
		async (
			_: any,
			args: { bookingId: string; tenantId: string; userId?: string },
			ctx
		) => {
			const cancellationService = new CancellationService(ctx.prisma);

			return cancellationService.cancelBooking(
				args.bookingId,
				args.tenantId,
				args.userId
			);
		}
	),

	bulkCancelBookings: safeResolver(
		async (_: any, args: { bookingIds: string[]; tenantId: string }, ctx) => {
			const cancellationService = new CancellationService(ctx.prisma);

			return cancellationService.bulkCancelBookings(
				args.bookingIds,
				args.tenantId
			);
		}
	),

	checkInPassenger: safeResolver(
		async (_: any, args: { bookingId: string; tenantId: string }, ctx) => {
			const bookingService = new BookingService(ctx.prisma);

			return bookingService.checkInPassenger(args.bookingId, args.tenantId);
		}
	),
};
