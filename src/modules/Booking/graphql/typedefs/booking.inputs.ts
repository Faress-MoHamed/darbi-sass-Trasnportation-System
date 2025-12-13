import { gql } from "graphql-tag";

export const bookingInputs = gql`
	input CreateBookingInput {
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
`;
