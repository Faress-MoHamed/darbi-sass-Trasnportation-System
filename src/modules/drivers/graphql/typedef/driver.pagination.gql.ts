import gql from "graphql-tag";

export const driverPagination = gql`
	type DriverPagination {
		data: [Driver!]!
		meta: PaginationMeta!
	}
`;
