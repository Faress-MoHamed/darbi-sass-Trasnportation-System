import gql from "graphql-tag";

export const stationTypeDef = gql`
	# ============================
	# Scalars
	# ============================

	scalar DateTime

	# ============================
	# Types & Inputs related to getStation and getStations queries
	# ============================

	type Station {
		id: ID
		tenantId: ID
		name: String
		routeId: ID
		latitude: Float
		longitude: Float
		sequence: Int
		route: Route
		tripStations: [TripStation]
	}

	type StationPagination {
		data: [Station!]!
		meta: PaginationMeta!
	}

	type PaginationMeta {
		page: Int!
		limit: Int!
		total: Int!
		totalPages: Int!
	}

	input Filters {
		routeId: ID
		name: String
	}

	# ============================
	# Types related to Route and getStationsByRoute query
	# ============================

	type Route {
		id: ID
		tenantId: ID
		name: String
		distanceKm: Float
		estimatedTime: String
		active: Boolean
		stations: [Station]
		trips: [Trip]
		customFieldValues: [RouteCustomFieldValue]
	}

	type RouteCustomFieldValue {
		id: ID
		routeId: ID
		fieldName: String
		fieldValue: String
	}

	# ============================
	# Types related to Trip, TripStation and their queries
	# ============================

	enum TripStatus {
		active
		completed
		cancelled
	}
	type Trip {
		id: ID
		status: TripStatus
		departureTime: DateTime
		arrivalTime: DateTime
	}

	type TripStation {
		id: ID
		scheduledArrivalTime: DateTime
		actualArrivalTime: DateTime
		trip: Trip
	}
	# ============================
	# Inputs and Types related to Mutations
	# ============================

	input CreateStationInput {
		name: String!
		latitude: Float
		longitude: Float
		routeId: ID
		sequence: Int
	}

	input UpdateStationInput {
		name: String
		latitude: Float
		longitude: Float
		routeId: ID
		sequence: Int
	}

	input ReorderStationInput {
		stationId: ID!
		sequence: Int!
	}

	# ============================
	# Queries
	# ============================

	type StationsQuery {
		getStation(id: ID!, NoTripsIncluded: Int): Station
		getStations(
			id: ID
			meta: PaginationArgs
			filters: Filters
		): StationPagination
		getStationsByRoute(routeId: ID!): [Station]
		getStationsNear(
			latitude: Float!
			longitude: Float!
			radiusKm: Float
		): [Station]
	}
	type Query {
		stations: StationsQuery
	}
	# ============================
	# Mutations
	# ============================
	type StationMutations {
		createStation(data: CreateStationInput!): Station!
		updateStation(id: ID!, data: UpdateStationInput!): Station!
		deleteStation(id: ID!): Boolean!
		CreateMultipleStations(data: [CreateStationInput!]!): Int! # returns created count
		reorderStations(routeId: ID!, order: [ReorderStationInput!]!): Boolean!
	}
	type Mutation {
		station: StationMutations!
	}
`;
