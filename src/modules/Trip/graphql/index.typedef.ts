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
		departureTime: DateTime

		# Relations
		trip: Trip!
		station: Station!
	}

	type Trip {
		id: ID!

		routeId: ID
		busId: ID
		driverId: ID
		departureTime: DateTime
		arrivalTime: DateTime
		status: TripStatus!
		availableSeats: Int
		notes: String

		# Relations
		route: Route
		bus: Bus
		driver: Driver
		tripStations: [TripStation!]!
		bookings: [Booking!]!
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
`;
