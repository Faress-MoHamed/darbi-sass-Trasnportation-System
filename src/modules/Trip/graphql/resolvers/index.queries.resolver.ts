import { TripService, type TripFilters } from "../../trip.service";
import { protectedTenantResolver } from "../../../../helpers/safeResolver";

export const tripQueries = {
	Query: {
		trip: () => ({}),
	},
	TripQuery: {
		getTrip: protectedTenantResolver(
			async (_: any, args: { id: string }, ctx) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.getTripById(args.id);
			}
		),

		getTrips: protectedTenantResolver(
			async (
				_: any,
				args: {
					filters?: TripFilters;
					pagination?: { skip?: number; take?: number };
				},
				ctx
			) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.getTripsByTenant(
					ctx.tenant?.tenantId!,
					args.filters,
					args.pagination
				);
			}
		),

		getUpcomingTrips: protectedTenantResolver(
			async (_: any, args: { routeId?: string; hours?: number }, ctx) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.getUpcomingTrips(ctx.tenant?.tenantId!, args);
			}
		),

		getTripAvailableSeats: protectedTenantResolver(
			async (_: any, args: { tripId: string }, ctx) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.getAvailableSeats(args.tripId);
			}
		),
	},
};
