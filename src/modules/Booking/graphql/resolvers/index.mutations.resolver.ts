import { BookingService } from "../../booking.service";
import { PaymentService } from "../../services/Payment.service";
import { CancellationService } from "../../services/Cancellation.service";
import { safeResolver } from "../../../../helpers/safeResolver";
import { AppError } from "../../../../errors/AppError";
import { getPassengerByUserTenantId } from "../../utils/get_passenger_by_UserTenantId";
import { requireRole } from "./../../../../helpers/requireRole";

export const bookingMutations = {
	Mutation: {
		booking: () => ({}),
	},
	BookingMutation: {
		createBooking: safeResolver(async (_: any, args: { input: any }, ctx) => {
			const bookingService = new BookingService(ctx.prisma);
			const passenger = await getPassengerByUserTenantId(
				ctx.tenant?.tenantId!,
				ctx.userId!,
				ctx.prisma
			);
			return bookingService.createBooking({
				...args.input,
				tenantId: ctx.tenant?.tenantId!,
				passengerId: passenger?.id!,
			});
		}),

		processPayment: safeResolver(async (_: any, args: { input: any }, ctx) => {
			const paymentService = new PaymentService(ctx.prisma);

			return paymentService.processPayment(args.input);
		}),

		cancelBooking: safeResolver(
			async (
				_: any,
				args: { bookingId: string; tenantId: string; passengerId?: string },
				ctx
			) => {
				const cancellationService = new CancellationService(ctx.prisma);

				return cancellationService.cancelBooking(
					args.bookingId,
					args.tenantId,
					args.passengerId
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
			async (_: any, args: { bookingId: string }, ctx) => {
				const bookingService = new BookingService(ctx.prisma);
				const passenger = await getPassengerByUserTenantId(
					ctx.tenant?.tenantId!,
					ctx.userId!,
					ctx.prisma
				);
				if (passenger?.id === undefined) {
					throw new AppError("User ID is required for check-in");
				}
				return bookingService.checkInPassenger(args.bookingId, passenger.id);
			}
		),
	},
};
