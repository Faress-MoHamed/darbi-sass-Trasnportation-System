import { safeResolver } from "../../../../helpers/safeResolver";
import { RouteIdParamDto } from "../../dto/route.dto";
import { PaginationOptionsSchema } from "../../../stations/dto/PaginationOptions.dto";
import type { ResolverContext } from "../../../../types/ResolverTypes";
import {
	requireTenant,
	validateInput,
} from "../../validation/index.validation";
import type { PaginationArgs } from "../../../../helpers/pagination";
import type { RouteIdArgs, RouteWithStatusArgs } from "../../types/index.type";
import { RoutesQueriesService } from "../../services/routesQueries.service";

export const RouteQueryResolvers = {
	/**
	 * Get a single route by ID
	 */
	getRoute: safeResolver(
		async (_parent: any, args: RouteIdArgs, context: ResolverContext) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });
			requireTenant(context);

			const routeService = new RoutesQueriesService(context.prisma);
			return await routeService.getRouteById(args.routeId);
		}
	),

	/**
	 * Get all routes with pagination
	 */
	getRoutes: safeResolver(
		async (
			_parent: any,
			args: { meta: PaginationArgs },
			context: ResolverContext
		) => {
			const paginationData = validateInput(
				PaginationOptionsSchema,
				args?.meta ?? {}
			);

			const routeService = new RoutesQueriesService(context.prisma);
			return await routeService.getAllRoutes(paginationData);
		}
	),

	/**
	 * Get route with its trips (optionally filtered by status)
	 */
	getRouteWithTrips: safeResolver(
		async (
			_parent: any,
			args: RouteWithStatusArgs,
			context: ResolverContext
		) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });

			const routeService = new RoutesQueriesService(context.prisma);
			return await routeService.getRouteWithTrips(
				args.routeId,
				args.tripStatus
			);
		}
	),
};
