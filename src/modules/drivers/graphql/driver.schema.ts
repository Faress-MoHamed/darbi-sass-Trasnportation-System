import gql from "graphql-tag";

export const driverTypeDefs = gql`

	# Driver type definition
	type Driver {
		id: ID!
		tenantId: ID!
		userId: ID!
		user: User
		licenseNumber: String
		vehicleType: String
		status: DriverStatus!
		rating: Float
		connected: Boolean
	}

	# Driver status enum
	enum DriverStatus {
		available
		unavailable
		offline
	}

	# Input for creating a driver
	input CreateDriverInput {
		name: String!
		phone: String!
		password: String!
		email: String
		licenseNumber: String!
		vehicleType: String
		status: DriverStatus
	}

	# Input for updating a driver
	input UpdateDriverInput {
		licenseNumber: String
		vehicleType: String
		status: DriverStatus
		rating: Float
	}

	# Input for filtering drivers
	input DriverFilters {
		tenantId: ID
		status: DriverStatus
		vehicleType: String
		minRating: Float
		search: String
	}

	# Input for pagination
	input Pagination {
		page: Int
		limit: Int
	}

	# Paginated driver response
	type DriverConnection {
		nodes: [Driver!]!
		totalCount: Int!
		pageInfo: PageInfo!
	}

	# Page information for pagination
	type PageInfo {
		currentPage: Int!
		totalPages: Int!
		hasNextPage: Boolean!
		hasPreviousPage: Boolean!
	}

	# Driver statistics
	type DriverStatistics {
		totalTrips: Int!
		completedTrips: Int!
		cancelledTrips: Int!
		activeTrips: Int!
		rating: Float
	}

	# Queries
	extend type Query {
		# Get a single driver by ID
		driver(id: ID!): Driver

		# Get a driver by user ID
		driverByUserId(userId: ID!): Driver

		# List drivers with optional filters and pagination
		drivers(filters: DriverFilters, pagination: Pagination): DriverConnection!

		# Get driver statistics
		driverStatistics(driverId: ID!): DriverStatistics!

		# Get driver trip history
		# TODO: Uncomment in Week 4 when Trip type is defined
		# driverTripHistory(driverId: ID!, filters: TripHistoryFilters): [Trip!]!
	}

	# Mutations
	extend type Mutation {
		# Create a new driver
		createDriver(input: CreateDriverInput!): Driver!

		# Update an existing driver
		updateDriver(id: ID!, input: UpdateDriverInput!): Driver!

		# Delete a driver
		deleteDriver(id: ID!): Boolean!

		# Update driver status
		updateDriverStatus(id: ID!, status: DriverStatus!): Driver!
	}
`;
