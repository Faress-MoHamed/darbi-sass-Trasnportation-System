import gql from "graphql-tag";

export const busTypeDefs = gql`

	# Bus type definition
	type Bus {
		id: ID!
		tenantId: ID!
		busNumber: String!
		capacity: Int
		type: String
		status: BusStatus!
		gpsTrackerId: String
		maintenanceStatus: String
		trips: [Trip!]
	}

	# Bus status enum
	enum BusStatus {
		active
		maintenance
		stopped
	}

	# Input for creating a bus
	input CreateBusInput {
		busNumber: String!
		capacity: Int
		type: String
		status: BusStatus
		gpsTrackerId: String
		maintenanceStatus: String
	}

	# Input for updating a bus
	input UpdateBusInput {
		busNumber: String
		capacity: Int
		type: String
		status: BusStatus
		gpsTrackerId: String
		maintenanceStatus: String
	}

	# Input for filtering buses
	input BusFilters {
		tenantId: ID
		status: BusStatus
		type: String
		minCapacity: Int
		maxCapacity: Int
		search: String
	}

	# Input for pagination
	input Pagination {
		page: Int
		limit: Int
	}

	# Paginated bus response
	type BusConnection {
		nodes: [Bus!]!
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

	# Bus statistics
	type BusStatistics {
		totalTrips: Int!
		completedTrips: Int!
		activeTrips: Int!
	}

	# Queries
	extend type Query {
		# Get a single bus by ID
		bus(id: ID!): Bus

		# List buses with optional filters and pagination
		buses(filters: BusFilters, pagination: Pagination): BusConnection!

		# Get bus statistics
		busStatistics(busId: ID!): BusStatistics!
	}

	# Mutations
	extend type Mutation {
		# Create a new bus
		createBus(input: CreateBusInput!): Bus!

		# Update an existing bus
		updateBus(id: ID!, input: UpdateBusInput!): Bus!

		# Update bus status
		updateBusStatus(id: ID!, status: BusStatus!, maintenanceStatus: String): Bus!

		# Delete a bus
		deleteBus(id: ID!): Boolean!
	}
`;
