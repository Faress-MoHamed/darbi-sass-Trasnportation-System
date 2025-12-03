import gql from "graphql-tag";

export const BookingTypeDefs = gql`
	enum BookingStatus {
		confirmed
		cancelled
		pending
	}
	type Booking {
		id: ID!

		tripId: ID
		userId: ID
		seatNumber: String
		status: BookingStatus!
		ticketNumber: String
		bookingDate: String
		paymentId: ID

		trip: Trip
		user: User
	}
`;
