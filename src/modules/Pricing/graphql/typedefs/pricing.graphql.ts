import gql from "graphql-tag";

export const PrisingTypeDef = gql`
	# src/modules/pricing/graphql/typedefs/pricing.graphql

	type PricingRule {
		id: ID!
		tenantId: ID!
		name: String!
		description: String
		type: PricingType!
		status: PricingStatus!
		priority: Int!
		isDefault: Boolean!
		basePrice: Float
		pricePerKm: Float
		minPrice: Float
		maxPrice: Float
		peakMultiplier: Float
		peakStartTime: String
		peakEndTime: String
		validFrom: DateTime
		validUntil: DateTime
		applicableDays: [Int!]
		metadata: JSON
		routePricing: [RoutePricing!]
		stationPricing: [StationPricing!]
		tripPricing: [TripPricing!]
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	type RoutePricing {
		id: ID!
		pricingRuleId: ID!
		routeId: ID!
		basePrice: Float!
		currency: String!
		pricingRule: PricingRule
		route: Route
	}

	type StationPricing {
		id: ID!
		pricingRuleId: ID!
		routeId: ID!
		fromStationId: ID!
		toStationId: ID!
		price: Float!
		stationCount: Int!
		currency: String!
		pricingRule: PricingRule
		route: Route
		fromStation: Station
		toStation: Station
	}

	type TripPricing {
		id: ID!
		tripId: ID!
		pricingRuleId: ID
		basePrice: Float!
		finalPrice: Float!
		currency: String!
		appliedAt: DateTime!
		trip: Trip
		pricingRule: PricingRule
	}

	type Discount {
		id: ID!
		tenantId: ID!
		code: String!
		name: String!
		description: String
		type: DiscountType!
		value: Float!
		minAmount: Float
		maxDiscount: Float
		usageLimit: Int
		usageCount: Int!
		validFrom: DateTime!
		validUntil: DateTime!
		isActive: Boolean!
		createdAt: DateTime!
		bookingDiscounts: [BookingDiscount!]
	}

	type BookingDiscount {
		id: ID!
		bookingId: ID!
		discountId: ID!
		discountAmount: Float!
		appliedAt: DateTime!
		booking: Booking
		discount: Discount
	}

	type PriceCalculation {
		basePrice: Float!
		pricePerPassenger: Float!
		passengers: Int!
		subtotal: Float!
		discountAmount: Float!
		finalPrice: Float!
		currency: String!
		appliedRule: ID
		appliedDiscount: Discount
		breakdown: [String!]!
	}

	enum PricingType {
		flat_rate
		distance_based
		station_based
		dynamic
		time_based
	}

	enum PricingStatus {
		active
		inactive
		scheduled
	}

	enum DiscountType {
		percentage
		fixed_amount
	}

	input CreatePricingRuleInput {
		name: String!
		description: String
		type: PricingType!
		status: PricingStatus
		priority: Int
		isDefault: Boolean
		basePrice: Float
		pricePerKm: Float
		minPrice: Float
		maxPrice: Float
		peakMultiplier: Float
		peakStartTime: String
		peakEndTime: String
		validFrom: DateTime
		validUntil: DateTime
		applicableDays: [Int!]
		metadata: JSON
	}

	input UpdatePricingRuleInput {
		id: ID!
		name: String
		description: String
		type: PricingType
		status: PricingStatus
		priority: Int
		isDefault: Boolean
		basePrice: Float
		pricePerKm: Float
		minPrice: Float
		maxPrice: Float
		peakMultiplier: Float
		peakStartTime: String
		peakEndTime: String
		validFrom: DateTime
		validUntil: DateTime
		applicableDays: [Int!]
		metadata: JSON
	}

	input CreateRoutePricingInput {
		pricingRuleId: ID!
		routeId: ID!
		basePrice: Float!
		currency: String
	}

	input CreateStationPricingInput {
		pricingRuleId: ID!
		routeId: ID!
		fromStationId: ID!
		toStationId: ID!
		price: Float!
		stationCount: Int!
		currency: String
	}

	input StationPricingMatrixItem {
		fromStationId: ID!
		toStationId: ID!
		price: Float!
		stationCount: Int!
	}

	input BulkCreateStationPricingInput {
		pricingRuleId: ID!
		routeId: ID!
		pricingMatrix: [StationPricingMatrixItem!]!
	}

	input SetTripPricingInput {
		tripId: ID!
		pricingRuleId: ID
		basePrice: Float!
		finalPrice: Float!
		currency: String
	}

	input CreateDiscountInput {
		code: String!
		name: String!
		description: String
		type: DiscountType!
		value: Float!
		minAmount: Float
		maxDiscount: Float
		usageLimit: Int
		validFrom: DateTime!
		validUntil: DateTime!
		isActive: Boolean
	}

	input UpdateDiscountInput {
		id: ID!
		code: String
		name: String
		description: String
		type: DiscountType
		value: Float
		minAmount: Float
		maxDiscount: Float
		usageLimit: Int
		validFrom: DateTime
		validUntil: DateTime
		isActive: Boolean
	}

	input PricingRuleFilters {
		type: PricingType
		status: PricingStatus
		isDefault: Boolean
		validAt: DateTime
	}

	input CalculateBookingPriceInput {
		tripId: ID!
		fromStationId: ID
		toStationId: ID
		discountCode: String
		passengers: Int
	}

	type Query {
		# Pricing Rules
		pricingRule(id: ID!): PricingRule
		pricingRules(filters: PricingRuleFilters!): [PricingRule!]!

		# Route Pricing
		routePricing(routeId: ID!, pricingRuleId: ID): [RoutePricing!]!

		# Station Pricing
		stationPricing(routeId: ID!, pricingRuleId: ID): [StationPricing!]!

		# Trip Pricing
		tripPricing(tripId: ID!): TripPricing

		# Discounts
		discount(id: ID!): Discount
		discountByCode(code: String!, tenantId: ID!): Discount
		discounts(isActive: Boolean): [Discount!]!

		# Price Calculation
		calculateBookingPrice(input: CalculateBookingPriceInput!): PriceCalculation!
	}

	type Mutation {
		# Pricing Rules
		createPricingRule(input: CreatePricingRuleInput!): PricingRule!
		updatePricingRule(input: UpdatePricingRuleInput!): PricingRule!
		deletePricingRule(id: ID!): Boolean!

		# Route Pricing
		createRoutePricing(input: CreateRoutePricingInput!): RoutePricing!
		updateRoutePricing(
			id: ID!
			basePrice: Float
			currency: String
		): RoutePricing!
		deleteRoutePricing(id: ID!): Boolean!

		# Station Pricing
		createStationPricing(input: CreateStationPricingInput!): StationPricing!
		bulkCreateStationPricing(
			input: BulkCreateStationPricingInput!
		): [StationPricing!]!
		deleteStationPricing(id: ID!): Boolean!

		# Trip Pricing
		setTripPricing(input: SetTripPricingInput!): TripPricing!
		autoSetTripPricing(tripId: ID!): TripPricing!

		# Discounts
		createDiscount(input: CreateDiscountInput!): Discount!
		updateDiscount(input: UpdateDiscountInput!): Discount!
		deleteDiscount(id: ID!): Boolean!
		applyDiscount(bookingId: ID!, discountCode: String!): Booking!
	}
`;
