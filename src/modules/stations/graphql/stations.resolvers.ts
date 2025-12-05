import { AppError } from "../../../errors/AppError";
import { ValidationError } from "../../../errors/ValidationError";
import { createResolvers } from "../../../helpers/createResolver";
import { safeResolver } from "../../../helpers/safeResolver";
import { CreateMultipleStationsDtoSchema } from "../dto/CreateMultipleStations.dto";
import { CreateStationDtoSchema } from "../dto/CreateStation.dto";
import { PaginationOptionsSchema } from "../dto/PaginationOptions.dto";
import { StationFiltersSchema } from "../dto/StationFilters.dto";
import { ReorderStationsDtoSchema } from "../dto/StationOrder.dto";
import { StationsNearLocationDtoSchema } from "../dto/StationsNearLocation.dto";
import { UpdateStationDtoSchema } from "../dto/UpdateStation.dto";
import { StationService } from "../stations.service";

export const stationResolvers = createResolvers({
	StationsQuery: {
		getStation: safeResolver(async (_: any, { id ,NoTripsIncluded}: any, context) => {
			// Validate id as UUID string (simple check)
			if (typeof id !== "string" || !id.match(/^[0-9a-fA-F-]{36}$/)) {
				throw new AppError("Invalid station ID", 400);
			}

			const stationService = new StationService(context?.prisma);
			return stationService.getStationById(id,NoTripsIncluded);
		}),

		getStations: safeResolver(async (_: any, args: any, context) => {
			// Validate filters and pagination if provided
			const filtersValidation = StationFiltersSchema.safeParse(
				args.filters ?? {}
			);
			const paginationValidation = PaginationOptionsSchema.safeParse(
				args.meta ?? {}
			);

			if (!filtersValidation.success) {
				throw new ValidationError(filtersValidation.error, 400);
			}
			if (!paginationValidation.success) {
				throw new ValidationError(paginationValidation.error, 400);
			}

			const stationService = new StationService(context?.prisma);

			return stationService.getStations({
				id: args.id,
				filters: filtersValidation.data,
				meta: paginationValidation.data,
			});
		}),

		getStationsByRoute: safeResolver(
			async (_: any, { routeId }: any, context) => {
				if (
					typeof routeId !== "string" ||
					!routeId.match(/^[0-9a-fA-F-]{36}$/)
				) {
					throw new AppError("Invalid route ID");
				}

				const stationService = new StationService(context?.prisma);
				return stationService.getStationsByRoute(routeId);
			}
		),

		getStationsNear: safeResolver(async (_: any, args: any, context) => {
			const validation = StationsNearLocationDtoSchema.safeParse(args);
			if (!validation.success) {
				throw new ValidationError(validation.error, 400);
			}

			const { latitude, longitude, radiusKm } = validation.data;
			const stationService = new StationService(context?.prisma);
			return stationService.getStationsNearLocation(
				latitude,
				longitude,
				radiusKm
			);
		}),
	},
	Query: {
		stations: () => ({}), // Returns empty object for namespace
	},
	Mutation: {
		station: () => ({}), // Returns empty object for namespace
	},
	StationMutations: {
		createStation: safeResolver(async (_: any, { data }: any, context) => {
			const validation = CreateStationDtoSchema.safeParse(data);
			if (!validation.success) {
				throw new ValidationError(validation.error, 400);
			}

			const stationService = new StationService(context?.prisma);
			return stationService.createStation(data);
		}),

		updateStation: safeResolver(async (_: any, { id, data }: any, context) => {
			if (typeof id !== "string" || !id.match(/^[0-9a-fA-F-]{36}$/)) {
				throw new AppError("Invalid station ID");
			}
			const validation = UpdateStationDtoSchema.safeParse(data);
			if (!validation.success) {
				throw new ValidationError(validation.error, 400);
			}

			const stationService = new StationService(context?.prisma);
			return stationService.updateStation(id, validation.data);
		}),

		deleteStation: safeResolver(async (_: any, { id }: any, context) => {
			if (typeof id !== "string" || !id.match(/^[0-9a-fA-F-]{36}$/)) {
				throw new AppError("Invalid station ID");
			}

			const stationService = new StationService(context?.prisma);
			await stationService.deleteStation(id);
			return true;
		}),

		CreateMultipleStations: safeResolver(
			async (_: any, { data }: any, context) => {
				console.log({
					data: data?.map((station: any) => ({
						...station,
					})),
				});
				const validation = CreateMultipleStationsDtoSchema.safeParse({
					stations: data?.map((station: any) => ({
						...station,
					})),
				});
				if (!validation.success) {
					throw new ValidationError(validation.error, 400);
				}

				const stationService = new StationService(context?.prisma);
				return stationService.CreateMultipleStations(data.stations);
			}
		),

		reorderStations: safeResolver(
			async (_: any, { routeId, order }: any, context) => {
				const validation = ReorderStationsDtoSchema.safeParse({
					routeId,
					stationOrder: order,
				});
				if (!validation.success) {
					throw new ValidationError(validation.error, 400);
				}

				const stationService = new StationService(context?.prisma);
				await stationService.reorderStations(
					validation.data.routeId,
					validation.data.stationOrder
				);
				return true;
			}
		),
	},
});
