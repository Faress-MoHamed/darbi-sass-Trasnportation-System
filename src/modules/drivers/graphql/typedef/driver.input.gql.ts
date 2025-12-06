import gql from "graphql-tag";

export const driverInputs = gql`
	input CuDriverInput {
		name: String
		phone: String
		password: String
		email: String
		licenseNumber: String
		vehicleType: String
		status: DriverStatus
	}

	input DriverFilters {
		tenantId: ID
		status: DriverStatus
		vehicleType: String
		minRating: Float
		search: String
	}

	input Pagination {
		page: Int
		limit: Int
	}
`;
