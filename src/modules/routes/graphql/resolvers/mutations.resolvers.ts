// ============================================================================
// Mutation Resolvers
// ============================================================================

import { Decimal } from "@prisma/client/runtime/client";
import { safeResolver } from "../../../../helpers/safeResolver";
import { validateInput } from "../../../../helpers/validateInput";
import type { ResolverContext } from "../../../../types/ResolverTypes";
import {
	AddStationToRouteDto,
	CreateRouteDto,
	DeleteRoutesDto,
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
	validateNoActiveTrips,
} from "../../validation/index.validation";

export const mutationResolvers = {
	/**
	 * Create a new route
	 */
	createRoute: safeResolver(
		async (_parent: any, args: CreateRouteArgs, context: ResolverContext) => {
			const validatedInput = validateInput(CreateRouteDto, {
				...args.input,
				stations:
					args.input.stations?.map((station) => ({
						...station,
						latitude: new Decimal(station.latitude || 0),
						longitude: new Decimal(station.longitude || 0),
						tenantId: context.tenant!.tenantId,
					})) || [],
			});
			const routeService = createRouteService(context);
			return await routeService.createRoute({
				...validatedInput,
				stations: validatedInput.stations?.map((station) => ({
					...station,
					latitude: new Decimal(station.latitude),
					longitude: new Decimal(station.longitude),
					tenantId: context.tenant!.tenantId,
				})),
				tenantId: context.tenant!.tenantId,
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
	 * Permanently delete a route
	 */
	deleteRoute: safeResolver(
		async (
			_parent: any,
			args: {
				routeId: string[];
			},
			context: ResolverContext
		) => {
			console.log({args})
			validateInput(DeleteRoutesDto, args);
			const routeService = createRouteService(context);
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
