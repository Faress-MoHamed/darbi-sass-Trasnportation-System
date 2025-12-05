import gql from "graphql-tag";

export const RouteTypeDef = gql`
	# ============================================================================
	# Enums
	# ============================================================================

	enum BusStatus {
		active
		maintenance
		stopped
	}

	enum DriverStatus {
		available
		unavailable
		offline
	}

	# ============================================================================
	# Types
	# ============================================================================

	type Route {
		id: ID!

		name: String!
		distanceKm: Float
		estimatedTime: String # Time format (HH:mm:ss)
		active: Boolean
		createdAt: DateTime!
		updatedAt: DateTime!

		# Relations
		stations: [Station!]!
		trips: [Trip!]!
	}

	type Bus {
		id: ID!

		busNumber: String!
		capacity: Int
		type: String
		status: BusStatus!
		gpsTrackerId: String
		maintenanceStatus: String
	}

	type Driver {
		id: ID!

		userId: ID!
		licenseNumber: String
		vehicleType: String
		status: DriverStatus!
		rating: Float
		connected: Boolean

		# Relations
		user: User!
	}

	# ============================================================================
	# Route with Relations Types
	# ============================================================================

	type RouteWithStations {
		id: ID!

		name: String!
		distanceKm: Float
		estimatedTime: String
		active: Boolean
		stations: [Station!]!
	}

	type RouteWithActiveTrips {
		id: ID!
		name: String!
		distanceKm: Float
		estimatedTime: String
		active: Boolean
		stations: [Station!]!
		trips: [Trip!]!
	}

	type DriverWithUser {
		id: ID!
		licenseNumber: String
		status: DriverStatus!
		rating: Float
		user: UserBasic!
	}

	type UserBasic {
		name: String
		phone: String!
	}
	type RoutePagination {
		data: [Route!]!
		meta: PaginationMeta!
	}
	# ============================================================================
	# Search Results
	# ============================================================================

	type SearchRoutesResult {
		routes: [RouteWithStations!]!
		total: Int!
	}

	type PaginatedRoutes {
		data: [Route!]!
		total: Int!
		page: Int!
		limit: Int!
		totalPages: Int!
	}

	# ============================================================================
	# Input Types
	# ============================================================================

	input CreateRouteInput {
		name: String!
		distanceKm: Float
		estimatedTime: String
		active: Boolean
		stations: [ID!] # Array of station IDs
	}

	input UpdateRouteInput {
		name: String
		distanceKm: Float
		estimatedTime: String
		active: Boolean
	}

	input AddStationToRouteInput {
		name: String!
		latitude: Float
		longitude: Float
		sequence: Int
	}

	input StationOrderInput {
		stationId: ID!
		sequence: Int!
	}

	input ReorderStationsInput {
		stationOrder: [StationOrderInput!]!
	}

	input SearchRoutesInput {
		searchTerm: String!
		active: Boolean
		skip: Int
		take: Int
	}

	input GetRoutesWithUpcomingTripsInput {
		hoursAhead: Int!
	}

	# ============================================================================
	# Queries
	# ============================================================================

	type RoutesQuery {
		"""
		Get route by ID
		"""
		getRoutes(id: ID, meta: PaginationArgs, filters: Filters): RoutePagination
		getRoute(routeId: ID!): Route

		"""
		Get all routes for a tenant with pagination
		"""
		getRoutesByTenant(pagination: PaginationArgs): PaginatedRoutes!

		"""
		Get route with active trips
		"""
		getRouteWithActiveTrips(routeId: ID!): RouteWithActiveTrips

		"""
		Search routes by name
		"""
		searchRoutes(params: SearchRoutesInput!): SearchRoutesResult!

		"""
		Get routes with upcoming trips
		"""
		getRoutesWithUpcomingTrips(
			params: GetRoutesWithUpcomingTripsInput!
		): [RouteWithActiveTrips!]!
	}
	type Query {
		routes: RoutesQuery
	}
	# ============================================================================
	# Mutations
	# ============================================================================

	type RouteMutation {
		"""
		Create a new route
		"""
		createRoute(input: CreateRouteInput!): RouteWithStations!

		"""
		Update route
		"""
		updateRoute(
			routeId: ID!

			input: UpdateRouteInput!
		): RouteWithStations!

		"""
		Soft delete route (set active to false)
		"""
		disactivateRoute(routeId: ID!): Route!

		"""
		Hard delete route
		"""
		deleteRoute(routeId: ID!): Route!

		"""
		Add station to route
		"""
		addStationToRoute(
			routeId: ID!

			input: AddStationToRouteInput!
		): Station!

		"""
		Reorder stations in a route
		"""
		reorderStations(
			routeId: ID!

			input: ReorderStationsInput!
		): [Station!]!

		"""
		Reorder stations by proximity (auto-optimization)
		"""
		reorderStationsByProximity(routeId: ID!): [Station!]!

		"""
		Toggle route active status
		"""
		toggleRouteStatus(routeId: ID!): Route!
	}

	type Mutation {
		route: RouteMutation
	}
`;
