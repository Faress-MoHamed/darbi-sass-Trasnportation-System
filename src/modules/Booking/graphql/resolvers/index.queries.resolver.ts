import { protectedTenantResolver } from "../../../../helpers/safeResolver";
import { BookingService } from "../../booking.service";

export const bookingQueries = {
	Query: {
		booking: () => ({}),
	},
	BookingQuery: {
		booking: protectedTenantResolver(
			async (_: any, args: { id: string }, ctx) => {
				const bookingService = new BookingService(ctx.prisma);

				return bookingService.getBooking(args.id, ctx.tenant?.tenantId);
			}
		),

		bookings: protectedTenantResolver(
			async (_: any, args: { input: any }, ctx) => {
				const bookingService = new BookingService(ctx.prisma);

				return bookingService.searchBookings(args.input);
			}
		),

		userBookings: protectedTenantResolver(
			async (
				_: any,
				args: {
					userId: string;

					status?: any;
					page?: number;
					limit?: number;
				},
				ctx
			) => {
				const bookingService = new BookingService(ctx.prisma);

				return bookingService.getUserBookings(
					args.userId,
					ctx.tenant?.tenantId,
					{
						status: args.status,
						page: args.page,
						limit: args.limit,
					}
				);
			}
		),

		upcomingBookings: protectedTenantResolver(
			async (_: any, args: { userId: string; limit?: number }, ctx) => {
				const bookingService = new BookingService(ctx.prisma);

				return bookingService.getUpcomingBookings(
					args.userId,
					ctx.tenant?.tenantId,
					args.limit
				);
			}
		),

		availableSeats: protectedTenantResolver(
			async (_: any, args: { tripId: string }, ctx) => {
				const bookingService = new BookingService(ctx.prisma);

				return bookingService.getAvailableSeats(
					args.tripId,
					ctx.tenant?.tenantId
				);
			}
		),

		verifyTicket: protectedTenantResolver(
			async (_: any, args: { ticketNumber: string }, ctx) => {
				const bookingService = new BookingService(ctx.prisma);

				return bookingService.verifyTicket(
					args.ticketNumber,
					ctx.tenant?.tenantId
				);
			}
		),
	},
};
