import { gql } from "graphql-tag";

export const bookingQueries = gql`
	type Query {
		booking: BookingQuery
	}
	type BookingQuery {
		booking(id: String!): Booking
		bookings(input: BookingSearchInput!): BookingPagination!

		userBookings(
			userId: String!
			status: BookingStatus
			page: Int
			limit: Int
		): [Booking!]!

		upcomingBookings(userId: String!, limit: Int): [Booking!]!

		bookingStatistics(
			startDate: String
			endDate: String
			userId: String
			tripId: String
		): BookingStatistics!

		availableSeats(tripId: String!): AvailableSeats!
		verifyTicket(ticketNumber: String!): TicketVerification!
	}
`;
