import { safeResolver } from "../../../../helpers/safeResolver";
import { BusService } from "../../buses.service";

export const busQueriesResolvers = {
	getBus: safeResolver(async (_: any, { id }: { id: string }, context) => {
		const busService = new BusService(context.prisma);
		return busService.getBusById(id);
	}),

	getBusByNumber: safeResolver(
		async (_: any, { busNumber }: { busNumber: string }, context) => {
			const busService = new BusService(context.prisma);
			return busService.getBusByNumber(busNumber);
		}
	),

	listBuses: safeResolver(async (_: any, { meta }: any, context) => {
		const busService = new BusService(context.prisma);
		return busService.listBuses(meta);
	}),

	getBusesByTenant: safeResolver(
		async (_: any, { status }: { status?: any }, context: any) => {
			const busService = new BusService(context.prisma);
			return busService.getBusesByTenant(status);
		}
	),

	getLatestBusLocation: safeResolver(
		async (_: any, { busId }: any, context) => {
			const busService = new BusService(context.prisma);
			return busService.getLatestBusLocation(busId);
		}
	),

	getBusGpsHistory: safeResolver(
		async (_: any, { busId, startDate, endDate }: any, context) => {
			const busService = new BusService(context.prisma);
			return busService.getBusGpsHistory(
				busId,
				startDate ? new Date(startDate) : undefined,
				endDate ? new Date(endDate) : undefined
			);
		}
	),

	getActiveTripsByBus: safeResolver(async (_: any, { busId }: any, context) => {
		const busService = new BusService(context.prisma);
		return busService.getActiveTripsByBus(busId);
	}),

	getTripHistoryByBus: safeResolver(
		async (_: any, { busId, limit }: any, context) => {
			const busService = new BusService(context.prisma);
			return busService.getTripHistoryByBus(busId, limit);
		}
	),

	isBusAvailable: safeResolver(
		async (_: any, { busId, startTime, endTime }: any, context) => {
			const busService = new BusService(context.prisma);
			return busService.isBusAvailable(
				busId,
				new Date(startTime),
				new Date(endTime)
			);
		}
	),

	getAvailableBuses: safeResolver(
		async (_: any, { startTime, endTime }: any, context) => {
			const busService = new BusService(context.prisma);
			return busService.getAvailableBuses(
				new Date(startTime),
				new Date(endTime)
			);
		}
	),

	getBusesDueForMaintenance: safeResolver(
		async (_: any, { thresholdKm }: any, context) => {
			const busService = new BusService(context.prisma);
			return busService.getBusesDueForMaintenance(thresholdKm);
		}
	),
};
