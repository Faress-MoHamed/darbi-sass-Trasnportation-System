import gql from "graphql-tag";

export const driverInputs = gql`
	input CuDriverInput {
		name: String
		phone: String
		password: String
		email: String
		licenseNumber: String
		status: DriverStatus
	}

	input DriverFilters {
		tenantId: ID
		status: DriverStatus
		minRating: Float
		search: String
	}

	input Pagination {
		page: Int
		limit: Int
	}
`;
