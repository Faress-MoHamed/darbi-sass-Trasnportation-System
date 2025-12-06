import gql from "graphql-tag";

export const driverMutations = gql`
	type DriverMutation {
		CuDriver(input: CuDriverInput!, id: ID): Driver!
		deleteDriver(id: ID!): Boolean!
		updateDriverStatus(id: ID!, status: DriverStatus!): Driver!
	}

	type Mutation {
		drivers: DriverMutation
	}
`;
