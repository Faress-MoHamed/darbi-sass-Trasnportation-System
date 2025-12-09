import gql from "graphql-tag";

export const busTypeDefs = gql`
	# ============================
	# ENUMS
	# ============================
	enum BusStatus {
		active
		maintenance
		stopped
	}

	# ============================
	# OBJECT TYPES
	# ============================
	type Bus {
		id: ID!

		busNumber: String!
		capacity: Int!
		type: String!
		status: BusStatus!
		gpsTrackerId: String
		maintenanceStatus: String
		createdAt: String!
		deletedAt: String
	}

	type BusLocation {
		latitude: Float!
		longitude: Float!
		timestamp: String!
	}

	type Trip {
		id: ID!
		busId: ID!
		startTime: String!
		endTime: String
	}
	type PaginatedBuses {
		data: [Bus!]!
		meta: PaginationMeta!
	}

	# ============================
	# INPUT TYPES — QUERY DTOs
	# ============================

	input GetBusGpsHistoryInput {
		busId: ID!
		startDate: String
		endDate: String
	}

	# ============================
	# INPUT TYPES — MUTATION DTOs
	# ============================
	input CreateBusInput {
		busNumber: String!
		capacity: Int!
		type: String!
		status: BusStatus
		gpsTrackerId: String
		maintenanceStatus: String
	}

	input UpdateBusDataInput {
		tenantId: ID
		busNumber: String
		capacity: Int
		type: String
		status: BusStatus
		gpsTrackerId: String
		maintenanceStatus: String
	}

	input UpdateBusInput {
		id: ID!
		data: UpdateBusDataInput!
	}

	input UpdateBusStatusInput {
		id: ID!
		status: BusStatus!
		maintenanceStatus: String
	}

	input SetMaintenanceInput {
		id: ID!
		maintenanceStatus: String!
	}

	input UpdateGpsTrackerInput {
		busId: ID!
		gpsTrackerId: String!
	}

	input ScheduleMaintenanceInput {
		busId: ID!
		maintenanceNotes: String!
	}

	input BulkUpdateStatusInput {
		busIds: [ID!]!
		status: BusStatus!
	}

	input BulkDeleteInput {
		busIds: [ID!]!
	}

	# ============================
	# ROOT QUERIES
	# ============================
	type Query {
		buses: BusQueries
	}
	type BusQueries {
		getBus(id: ID!): Bus
		getBusByNumber(busNumber: String!): Bus
		listBuses(meta: PaginationArgs): PaginatedBuses
		getBusesByTenant(status: BusStatus): [Bus!]!

		getLatestBusLocation(busId: ID!): BusLocation
		getBusGpsHistory(
			busId: ID!
			startDate: String
			endDate: String
		): [BusLocation!]!

		getActiveTripsByBus(busId: ID!): [Trip!]!
		getTripHistoryByBus(busId: ID!, limit: Int): [Trip!]!

		isBusAvailable(busId: ID!, startTime: String!, endTime: String!): Boolean!

		getAvailableBuses(startTime: String!, endTime: String!): [Bus!]!

		getBusesDueForMaintenance(thresholdKm: Int): [Bus!]!
	}

	# ============================
	# ROOT MUTATIONS
	# ============================
	type BusMutations {
		createBus(data: CreateBusInput!): Bus!
		updateBus(id: ID!, data: UpdateBusDataInput!): Bus!
		deleteBus(id: ID!): Boolean!
		hardDeleteBus(id: ID!): Boolean!
		restoreBus(id: ID!): Boolean!

		updateBusStatus(
			id: ID!
			status: BusStatus!
			maintenanceStatus: String
		): Bus!
		activateBus(id: ID!): Bus!
		deactivateBus(id: ID!): Bus!
		setMaintenance(id: ID!, maintenanceStatus: String!): Bus!

		updateGpsTracker(busId: ID!, gpsTrackerId: String!): Bus!
		scheduleMaintenance(busId: ID!, maintenanceNotes: String!): Bus!
		completeMaintenance(busId: ID!): Bus!

		bulkUpdateStatus(busIds: [ID!]!, status: BusStatus!): Boolean!
		bulkDelete(busIds: [ID!]!): Boolean!
	}

	type Mutation {
		buses: BusMutations
	}
`;
