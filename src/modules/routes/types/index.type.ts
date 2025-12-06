// ============================================================================
// Types
// ============================================================================

import type { TripStatus } from "@prisma/client";
import type { CreateRoute } from "../route.type";
import type {
	AddStationToRouteDto,
	ReorderStationsDto,
	UpdateRouteDto,
} from "../dto/route.dto";

export interface RouteIdArgs {
	routeId: string;
}

export interface RouteWithStatusArgs extends RouteIdArgs {
	tripStatus?: TripStatus;
}

export interface CreateRouteArgs {
	input: CreateRoute;
}

export interface UpdateRouteArgs extends RouteIdArgs {
	input: UpdateRouteDto;
}

export interface AddStationArgs extends RouteIdArgs {
	tenantId: string;
	input: AddStationToRouteDto;
}

export interface ReorderStationsArgs extends RouteIdArgs {
	input: ReorderStationsDto;
}
