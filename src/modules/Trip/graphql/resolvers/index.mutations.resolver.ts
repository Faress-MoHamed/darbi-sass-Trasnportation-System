import { TripService } from "../../trip.service";
import { protectedTenantResolver } from "../../../../helpers/safeResolver";
import { TripStatus } from "@prisma/client";

export const tripMutations = {
	Mutation: {
		trip: () => ({}),
	},
	TripMutation: {
		createTrip: protectedTenantResolver(
			async (_: any, args: { input: any }, ctx) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.createTrip({
					...args.input,
					tenantId: ctx.tenant?.tenantId!,
				});
			}
		),

		updateTrip: protectedTenantResolver(
			async (_: any, args: { id: string; input: any }, ctx) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.updateTrip(args.id, args.input);
			}
		),

		updateTripStatus: protectedTenantResolver(
			async (_: any, args: { id: string; status: TripStatus }, ctx) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.updateTripStatus(args.id, args.status);
			}
		),

		cancelTrip: protectedTenantResolver(
			async (_: any, args: { id: string }, ctx) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.cancelTrip(args.id);
			}
		),

		deleteTrip: protectedTenantResolver(
			async (_: any, args: { id: string }, ctx) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.deleteTrip(args.id);
			}
		),

		updateTripStationArrival: protectedTenantResolver(
			async (
				_: any,
				args: {
					input: {
						tripId: string;
						stationId: string;
						actualArrivalTime: Date;
					};
				},
				ctx
			) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.updateTripStationArrival(
					args.input.tripId,
					args.input.stationId,
					args.input.actualArrivalTime
				);
			}
		),

		logTripLocation: protectedTenantResolver(
			async (
				_: any,
				args: {
					input: {
						tripId: string;
						latitude: number;
						longitude: number;
						speed?: number;
						passengersCount?: number;
					};
				},
				ctx
			) => {
				const tripService = new TripService(ctx.prisma);
				return tripService.logTripLocation(args.input.tripId, {
					latitude: args.input.latitude,
					longitude: args.input.longitude,
					speed: args.input.speed,
					passengersCount: args.input.passengersCount,
				});
			}
		),
	},
};
