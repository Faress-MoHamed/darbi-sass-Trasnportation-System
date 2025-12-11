import { createResolvers } from "../../../../helpers/createResolver";
import type { PaginationArgs } from "../../../../helpers/pagination";
import { protectedTenantResolver } from "../../../../helpers/safeResolver";
import { validateInput } from "../../../../helpers/validateInput";
import { PaginationOptionsSchema } from "../../../stations/dto/PaginationOptions.dto";
import { DriverService } from "../../drivers.service";
import type { TripHistoryFiltersDto } from "../../dto/driver.dto";

export const DriverQueryResolvers = createResolvers({
	Query: {
		drivers: () => ({}),
	},
	DriverQueries: {
		driver: protectedTenantResolver(
			async (_: any, { id }: { id: string }, context) => {
				const service = new DriverService(context.prisma);
				return service.getDriverById(id);
			}
		),

		drivers: protectedTenantResolver(
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

				const service = new DriverService(context.prisma);
				return service.getAllDrivers(paginationData);
			}
		),

		// getDriverTripHistory: protectedTenantResolver(
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
		// 		const service = new DriverService(context.prisma);
		// 		return service.getDriverTripHistory(driverId, {
		// 			...filters,
		// 			meta: paginationData,
		// 		});
		// 	}
		// ),
	},
});
