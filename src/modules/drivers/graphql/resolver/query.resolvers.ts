import { createResolvers } from "../../../../helpers/createResolver";
import type { PaginationArgs } from "../../../../helpers/pagination";
import { requireTenant } from "../../../../helpers/requireTenant";
import { safeResolver } from "../../../../helpers/safeResolver";
import { validateInput } from "../../../../helpers/validateInput";
import { PaginationOptionsSchema } from "../../../stations/dto/PaginationOptions.dto";
import { DriverService } from "../../drivers.service";
import type { TripHistoryFiltersDto } from "../../dto/driver.dto";

export const DriverQueryResolvers = createResolvers({
	Query: {
		drivers: () => ({}),
	},
	DriverQueries: {
		driver: safeResolver(async (_: any, { id }: { id: string }, context) => {
			await requireTenant(context);
			const service = new DriverService(context.prisma);
			return service.getDriverById(id);
		}),

		drivers: safeResolver(
			async (
				_: any,
				{
					pagination,
				}: {
					pagination?: PaginationArgs;
				},
				context
			) => {
				const paginationData = validateInput(
					PaginationOptionsSchema,
					pagination ?? {}
				);
				await requireTenant(context);
				const service = new DriverService(context.prisma);
				return service.getAllDrivers(paginationData);
			}
		),

		// getDriverTripHistory: safeResolver(
		// 	async (
		// 		_: any,
		// 		{
		// 			driverId,
		// 			filters,
		// 		}: { driverId: string; filters?: TripHistoryFiltersDto },
		// 		context
		// 	) => {
		// 		const paginationData = validateInput(
		// 			PaginationOptionsSchema,
		// 			filters?.meta ?? {}
		// 		);
		// 		await requireTenant(context);
		// 		const service = new DriverService(context.prisma);
		// 		return service.getDriverTripHistory(driverId, {
		// 			...filters,
		// 			meta: paginationData,
		// 		});
		// 	}
		// ),
	},
});
