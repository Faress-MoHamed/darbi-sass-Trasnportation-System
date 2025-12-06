import gql from "graphql-tag";

export const driverQueries = gql`
	type DriverQueries {
		driver(id: ID!): Driver
		drivers(meta: PaginationArgs): DriverPagination!
		# getDriverTripHistory(
		# 	driverId: ID!
		# 	filters: TripHistoryFilters
		# ): TripPagination!
	}

	type Query {
		drivers: DriverQueries
	}
`;
