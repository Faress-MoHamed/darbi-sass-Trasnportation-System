// ============================================================================
// Query Resolvers

import { RouteService } from "../routes.services";
import { safeResolver } from "../../../helpers/safeResolver";
import {
	GetRoutesWithUpcomingTripsDto,
	SearchRoutesDto,
	CreateRouteDto,
	UpdateRouteDto,
	AddStationToRouteDto,
	ReorderStationsDto,
	RouteIdParamDto,
} from "../dto/route.dto";
import { createResolvers } from "../../../helpers/createResolver";
import { ValidationError } from "../../../errors/ValidationError";
import { AppError } from "../../../errors/AppError";
import { PaginationOptionsSchema } from "../../stations/dto/PaginationOptions.dto";
import type { CreateRoute } from "../route.type";

// ============================================================================
const RoutesResolvers = createResolvers({
	Query: {
		getRoute: safeResolver(async (_parent: any, args, context) => {
			const validation = RouteIdParamDto.safeParse({ routeId: args.routeId });
			if (validation.error) {
				throw new ValidationError(validation.error, 400);
			}
			if (!context.tenant?.tenantId) {
				throw new AppError("Unauthorized access");
			}
			const routeService = new RouteService(context?.prisma);
			const route = await routeService.getRouteById(args.routeId);
			return route;
		}),

		getRoutes: safeResolver(async (_parent: any, args, context) => {
			const paginationValidation = PaginationOptionsSchema.safeParse(
				args.meta ?? {}
			);
			if (paginationValidation.error) {
				throw new ValidationError(paginationValidation.error, 400);
			}
			const routeService = new RouteService(context?.prisma);
			return routeService.getRoutesByTenant(paginationValidation.data);
		}),

		getRouteWithActiveTrips: safeResolver(
			async (_parent: any, args: { routeId: string }, context) => {
				const routeValidation = RouteIdParamDto.safeParse({
					routeId: args.routeId,
				});
				if (routeValidation.error) {
					throw new ValidationError(routeValidation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);
				const route = await routeService.getRouteWithActiveTrips(args.routeId);

				if (!route) {
					throw new AppError("Route not found", 404);
				}

				return route;
			}
		),

		searchRoutes: safeResolver(
			async (_parent: any, args: { params: SearchRoutesDto }, context) => {
				const validation = SearchRoutesDto.safeParse(args.params);
				if (validation.error) {
					throw new ValidationError(validation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);
				return await routeService.searchRoutes(validation.data);
			}
		),

		getRoutesWithUpcomingTrips: safeResolver(
			async (
				_parent: any,
				args: { params: GetRoutesWithUpcomingTripsDto },
				context
			) => {
				const validation = GetRoutesWithUpcomingTripsDto.safeParse(args.params);
				if (validation.error) {
					throw new ValidationError(validation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);
				return await routeService.getRoutesWithUpcomingTrips(validation.data);
			}
		),
	},
	Mutation: {
		route: () => ({}), // Returns empty object for namespace
	},
	RouteMutation: {
		createRoute: safeResolver(
			async (_parent: any, args: { input: CreateRoute }, context) => {
				const validation = CreateRouteDto.safeParse(args.input);
				if (validation.error) {
					throw new ValidationError(validation.error, 400);
				}
				const routeService = new RouteService(context?.prisma);
				return await routeService.createRoute({
					...validation.data,
					tenantId: args.input.tenantId,
				});
			}
		),

		updateRoute: safeResolver(
			async (
				_parent: any,
				args: { routeId: string; input: UpdateRouteDto },
				context
			) => {
				const routeValidation = RouteIdParamDto.safeParse({
					routeId: args.routeId,
				});
				if (routeValidation.error) {
					throw new ValidationError(routeValidation.error, 400);
				}

				const validation = UpdateRouteDto.safeParse(args.input);
				if (validation.error) {
					throw new ValidationError(validation.error, 400);
				}
				const routeService = new RouteService(context?.prisma);
				const route = await routeService.updateRoute(
					args.routeId,

					validation.data
				);

				if (!route) {
					throw new AppError("Route not found", 404);
				}

				return route;
			}
		),

		disactivateRoute: safeResolver(
			async (_parent: any, args: { routeId: string }, context) => {
				const routeValidation = RouteIdParamDto.safeParse({
					routeId: args.routeId,
				});
				if (routeValidation.error) {
					throw new ValidationError(routeValidation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);
				return await routeService.DisActivate(args.routeId);
			}
		),

		deleteRoute: safeResolver(
			async (_parent: any, args: { routeId: string }, context) => {
				const routeValidation = RouteIdParamDto.safeParse({
					routeId: args.routeId,
				});
				if (routeValidation.error) {
					throw new ValidationError(routeValidation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);

				// Check if route has active trips
				const route = await routeService.getRouteWithActiveTrips(args.routeId);

				if (route?.trips && route.trips.length > 0) {
					throw new AppError(
						"Cannot delete route with active trips. Please cancel or complete all trips first.",
						409
					);
				}

				return await routeService.hardDeleteRoute(args.routeId);
			}
		),

		addStationToRoute: safeResolver(
			async (
				_parent: any,
				args: {
					routeId: string;
					tenantId: string;
					input: AddStationToRouteDto;
				},
				context
			) => {
				const routeValidation = RouteIdParamDto.safeParse({
					routeId: args.routeId,
				});
				if (routeValidation.error) {
					throw new ValidationError(routeValidation.error, 400);
				}

				const validation = AddStationToRouteDto.safeParse(args.input);
				if (validation.error) {
					throw new ValidationError(validation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);
				return await routeService.addStationToRoute(
					args.routeId,

					{ ...validation.data, tenantId: args.tenantId }
				);
			}
		),

		reorderStations: safeResolver(
			async (
				_parent: any,
				args: { routeId: string; input: ReorderStationsDto },
				context
			) => {
				const routeValidation = RouteIdParamDto.safeParse({
					routeId: args.routeId,
				});
				if (routeValidation.error) {
					throw new ValidationError(routeValidation.error, 400);
				}

				const validation = ReorderStationsDto.safeParse(args.input);
				if (validation.error) {
					throw new ValidationError(validation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);
				return await routeService.reorderStations(
					args.routeId,

					validation.data
				);
			}
		),

		reorderStationsByProximity: safeResolver(
			async (_parent: any, args: { routeId: string }, context) => {
				const validation = RouteIdParamDto.safeParse({ routeId: args.routeId });
				if (validation.error) {
					throw new ValidationError(validation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);
				return await routeService.reorderStationsByProximity(args.routeId);
			}
		),

		toggleRouteStatus: safeResolver(
			async (_parent: any, args: { routeId: string }, context) => {
				const routeValidation = RouteIdParamDto.safeParse({
					routeId: args.routeId,
				});
				if (routeValidation.error) {
					throw new ValidationError(routeValidation.error, 400);
				}

				const routeService = new RouteService(context?.prisma);
				return await routeService.toggleRouteStatus(args.routeId);
			}
		),
	},
});

export default RoutesResolvers;
