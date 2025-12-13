import { gql } from "graphql-tag";

export const bookingTypes = gql`
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

	type PaymentResult {
		success: Boolean!
		booking: Booking
	}
`;
