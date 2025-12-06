// ============================================================================
// Mutation Resolvers
// ============================================================================

import { safeResolver } from "../../../../helpers/safeResolver";
import type { ResolverContext } from "../../../../types/ResolverTypes";
import {
	AddStationToRouteDto,
	CreateRouteDto,
	ReorderStationsDto,
	RouteIdParamDto,
	UpdateRouteDto,
} from "../../dto/route.dto";
import { RoutesQueriesService } from "../../services/routesQueries.service";
import type {
	AddStationArgs,
	CreateRouteArgs,
	ReorderStationsArgs,
	RouteIdArgs,
	UpdateRouteArgs,
} from "../../types/index.type";
import {
	createRouteService,
	validateInput,
	validateNoActiveTrips,
} from "../../validation/index.validation";

export const mutationResolvers = {
	/**
	 * Create a new route
	 */
	createRoute: safeResolver(
		async (_parent: any, args: CreateRouteArgs, context: ResolverContext) => {
			const validatedInput = validateInput(CreateRouteDto, args.input);

			const routeService = createRouteService(context);
			return await routeService.createRoute({
				...validatedInput,
				tenantId: args.input.tenantId,
			});
		}
	),

	/**
	 * Update an existing route
	 */
	updateRoute: safeResolver(
		async (_parent: any, args: UpdateRouteArgs, context: ResolverContext) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });
			const validatedInput = validateInput(UpdateRouteDto, args.input);

			const routeService = createRouteService(context);
			return await routeService.updateRoute(args.routeId, validatedInput);
		}
	),

	/**
	 * Deactivate a route (soft delete)
	 */
	deactivateRoute: safeResolver(
		async (_parent: any, args: RouteIdArgs, context: ResolverContext) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });

			const routeService = createRouteService(context);
			return await routeService.deactivateRoute(args.routeId);
		}
	),

	/**
	 * Permanently delete a route
	 */
	deleteRoute: safeResolver(
		async (_parent: any, args: RouteIdArgs, context: ResolverContext) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });

			const QueryrouteService = new RoutesQueriesService(context.prisma);
			const routeService = createRouteService(context);
			// Validate route has no active trips before deletion
			await validateNoActiveTrips(QueryrouteService, args.routeId);

			return await routeService.deleteRoute(args.routeId);
		}
	),

	/**
	 * Add a station to a route
	 */
	addStationToRoute: safeResolver(
		async (_parent: any, args: AddStationArgs, context: ResolverContext) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });
			const validatedInput = validateInput(AddStationToRouteDto, args.input);

			const routeService = createRouteService(context);
			return await routeService.addStationToRoute(args.routeId, {
				...validatedInput,
				tenantId: args.tenantId,
			});
		}
	),

	/**
	 * Manually reorder stations in a route
	 */
	reorderStations: safeResolver(
		async (
			_parent: any,
			args: ReorderStationsArgs,
			context: ResolverContext
		) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });
			const validatedInput = validateInput(ReorderStationsDto, args.input);

			const routeService = createRouteService(context);
			return await routeService.reorderStations(args.routeId, validatedInput);
		}
	),

	/**
	 * Automatically reorder stations by geographic proximity
	 */
	reorderStationsByProximity: safeResolver(
		async (_parent: any, args: RouteIdArgs, context: ResolverContext) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });

			const routeService = createRouteService(context);
			return await routeService.reorderStationsByProximity(args.routeId);
		}
	),

	/**
	 * Toggle route active/inactive status
	 */
	toggleRouteStatus: safeResolver(
		async (_parent: any, args: RouteIdArgs, context: ResolverContext) => {
			validateInput(RouteIdParamDto, { routeId: args.routeId });

			const routeService = createRouteService(context);
			return await routeService.toggleRouteStatus(args.routeId);
		}
	),
};
