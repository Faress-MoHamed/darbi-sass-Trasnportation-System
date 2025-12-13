import { gql } from "graphql-tag";

export const bookingEnums = gql`
	enum BookingStatus {
		pending
		confirmed
		cancelled
	}
`;
