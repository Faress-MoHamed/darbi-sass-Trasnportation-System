// ===============================
// CreateRoute
// ===============================
export type CreateRoute = {
  tenantId: string; // UUID
	name: string;
	distanceKm?: number | undefined;
	estimatedTime?: string | undefined;
	active: boolean; // default: true
	stations?: string[] | undefined; // UUID[]
};

// ===============================
// UpdateRoute
// ===============================
export type UpdateRoute = {
	name?: string | undefined;
	distanceKm?: number | undefined;
	estimatedTime?: string | undefined;
	active?: boolean | undefined;
};

// ===============================
// AddStationToRoute
// ===============================
export type AddStationToRoute = {
	name: string;
	latitude?: number | null | undefined;
	longitude?: number | null | undefined;
  sequence?: number | undefined;
  tenantId: string; // UUID
};

// ===============================
// ReorderStations
// ===============================
export type ReorderStations = {
	stationOrder: {
		stationId: string; // UUID
		sequence: number;
	}[];
};

// ===============================
// SearchRoutes
// ===============================
export type SearchRoutes = {
	searchTerm: string;
	active?: boolean | undefined;
	skip: number; // default 0
	take: number; // default 10, max 100
};

// ===============================
// GetRoutesWithUpcomingTrips
// ===============================
export type GetRoutesWithUpcomingTrips = {
	hoursAhead: number; // default 24, max 168
};

// ===============================
// RouteIdParam
// ===============================
export type RouteIdParam = {
	routeId: string; // UUID
};
