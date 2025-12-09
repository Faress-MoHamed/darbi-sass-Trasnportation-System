import gql from "graphql-tag";

export default gql`
	type Route {
		id: ID!

		name: String!
		distanceKm: Float
		estimatedTime: String # Time format (HH:mm:ss)
		active: Boolean

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
		status: DriverStatus!
		rating: Float
		connected: Boolean

		# Relations
		user: User!
	}

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
`;
