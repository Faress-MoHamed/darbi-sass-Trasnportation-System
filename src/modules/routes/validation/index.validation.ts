// ============================================================================
// Helper Functions
// ============================================================================

import type { ZodSchema } from "zod";
import { ValidationError } from "../../../errors/ValidationError";
import type { ResolverContext } from "../../../types/ResolverTypes";
import { AppError } from "../../../errors/AppError";
import type { RoutesQueriesService } from "../services/routesQueries.service";
import { RouteMutationsService } from "../services/routeMutations.service";

/**
 * Create route service instance
 */
export function createRouteService(
	context: ResolverContext
): RouteMutationsService {
	return new RouteMutationsService(context.prisma);
}

/**
 * Check if route has active trips
 */
export async function validateNoActiveTrips(
	routeService: RoutesQueriesService,
	routeId: string
) {
	const route = await routeService.getRouteWithTrips(routeId, [
		"scheduled",
		"in_progress",
		"completed",
		"delayed",
		"boarding",
	]);

	if (route?.trips && route.trips.length > 0) {
		throw new AppError(
			"Cannot delete route with active trips. Please cancel or complete all trips first.",
			409
		);
	}
}
