import { gql } from "graphql-tag";

export const bookingMutations = gql`
	type Mutation {
		booking: BookingMutation
	}
	type BookingMutation {
		createBooking(input: CreateBookingInput!): Booking!
		processPayment(input: ProcessPaymentInput!): PaymentResult!

		cancelBooking(bookingId: String!, userId: String): Booking!

		bulkCancelBookings(bookingIds: [String!]!): [Booking!]!
		checkInPassenger(bookingId: String!): Booking!
	}
`;
