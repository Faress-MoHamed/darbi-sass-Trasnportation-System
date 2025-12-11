import { gql } from "graphql-tag";

export const bookingTypeDefs = gql`
	enum BookingStatus {
		pending
		confirmed
		cancelled
	}

	type Booking {
		id: ID!

		userId: String!
		tripId: String!
		ticketNumber: String!
		seatNumber: String
		bookingDate: String!
		status: BookingStatus!
		paymentId: String
		user: User
		trip: Trip
		ticket: Ticket
		customFieldValues: [BookingCustomFieldValue]
		createdAt: String!
		updatedAt: String!
	}

	type BookingCustomFieldValue {
		id: ID!
		bookingId: String!
		customFieldId: Int!
		value: String!
		customField: CustomField
	}

	type CustomField {
		id: Int!
		name: String!
		type: String!
		required: Boolean!
	}

	type Ticket {
		id: ID!

		bookingId: String!
		qrCode: String!
		issuedAt: String!
	}

	type BookingPagination {
		bookings: [Booking!]!
		pagination: PaginationInfo!
	}

	type PaginationInfo {
		page: Int!
		limit: Int!
		total: Int!
		totalPages: Int!
	}

	type BookingStatistics {
		total: Int!
		confirmed: Int!
		pending: Int!
		cancelled: Int!
		revenue: Float!
	}

	type AvailableSeats {
		totalSeats: Int!
		bookedSeats: Int!
		availableSeats: Int!
		bookedSeatNumbers: [String!]!
	}

	type TicketVerification {
		valid: Boolean!
		message: String!
		booking: Booking
	}

	input CreateBookingInput {
		userId: String!
		tripId: String!
		seatNumber: String
		paymentMethodId: String
		customFieldValues: [CustomFieldValueInput]
	}

	input CustomFieldValueInput {
		customFieldId: Int!
		value: String!
	}

	input BookingSearchInput {
		userId: String
		tripId: String
		status: BookingStatus
		startDate: String
		endDate: String
		page: Int
		limit: Int
	}

	input ProcessPaymentInput {
		bookingId: String!

		paymentMethodId: String!
		amount: Float!
	}

	type PaymentResult {
		success: Boolean!
		booking: Booking
	}

	extend type Query {
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

	extend type Mutation {
		createBooking(input: CreateBookingInput!): Booking!
		processPayment(input: ProcessPaymentInput!): PaymentResult!
		cancelBooking(
			bookingId: String!

			userId: String
		): Booking!
		bulkCancelBookings(bookingIds: [String!]!): [Booking!]!
		checkInPassenger(bookingId: String!): Booking!
	}
`;
