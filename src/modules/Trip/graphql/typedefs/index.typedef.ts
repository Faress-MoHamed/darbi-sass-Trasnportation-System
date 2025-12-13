import gql from "graphql-tag";

export const TripTypeDefs = gql`
	enum TripStatus {
		active
		completed
		cancelled
	}
	type TripStation {
		tripId: ID!
		stationId: ID!
		scheduledArrivalTime: DateTime
		actualArrivalTime: DateTime

		# Relations
		trip: Trip!
		station: Station!
	}

	type Trip {
		id: ID!
		tenantId: String!
		route: Route
		routeId: String
		bus: Bus
		busId: String
		driver: Driver
		driverId: String
		departureTime: DateTime
		arrivalTime: DateTime
		status: TripStatus!
		availableSeats: Int
		notes: String
		tripStations: [TripStation!]
		bookings: [Booking!]
		tripLogs: [TripLog!]
		# emergencyAlerts: [EmergencyAlert!]
		createdAt: DateTime
		updatedAt: DateTime
	}

	type TripWithDetails {
		id: ID!
		routeId: ID
		busId: ID
		driverId: ID
		departureTime: DateTime
		arrivalTime: DateTime
		status: TripStatus!
		availableSeats: Int

		bus: Bus
		driver: Driver
	}

	type TripLog {
		id: ID!
		tripId: String!
		trip: Trip!
		busLocationLat: Float
		busLocationLng: Float
		speed: Float
		passengersCount: Int
		timestamp: DateTime!
	}

	type TripsResponse {
		trips: [Trip!]!
		total: Int!
	}

	input CreateTripInput {
		routeId: String!
		busId: String!
		driverId: String!
		departureTime: DateTime!
		arrivalTime: DateTime
		status: TripStatus
		notes: String
		stations: [TripStationInput!]
	}

	input TripStationInput {
		stationId: String!
		scheduledArrivalTime: DateTime!
	}

	input UpdateTripInput {
		routeId: String
		busId: String
		driverId: String
		departureTime: DateTime
		arrivalTime: DateTime
		status: TripStatus
		availableSeats: Int
		notes: String
	}

	input TripFilters {
		status: TripStatus
		routeId: String
		busId: String
		driverId: String
		startDate: DateTime
		endDate: DateTime
	}

	input TripPagination {
		skip: Int
		take: Int
	}

	input UpdateTripStationInput {
		tripId: String!
		stationId: String!
		actualArrivalTime: DateTime!
	}

	input LogTripLocationInput {
		tripId: String!
		latitude: Float!
		longitude: Float!
		speed: Float
		passengersCount: Int
	}

	type Query {
		trip: TripQuery!
	}

	type TripQuery {
		getTrip(id: ID!): Trip
		getTrips(filters: TripFilters, pagination: TripPagination): TripsResponse!
		getUpcomingTrips(routeId: String, hours: Int): [Trip!]!
		getTripAvailableSeats(tripId: ID!): Int!
	}

	type Mutation {
		trip: TripMutation!
	}

	type TripMutation {
		createTrip(input: CreateTripInput!): Trip!
		updateTrip(id: ID!, input: UpdateTripInput!): Trip!
		updateTripStatus(id: ID!, status: TripStatus!): Trip!
		cancelTrip(id: ID!): Trip!
		deleteTrip(id: ID!): Trip!
		updateTripStationArrival(input: UpdateTripStationInput!): TripStation!
		logTripLocation(input: LogTripLocationInput!): TripLog!
	}
`;
