import gql from "graphql-tag";

export const userTypeDefs = gql`
	enum UserRole {
		admin
		supervisor
		driver
		passenger
	}

	type User {
		id: ID
		name: String
		email: String
		phone: String
		role: UserRole
	}
`;
