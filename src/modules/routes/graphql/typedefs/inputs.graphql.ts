import { gql } from "graphql-tag";
export default gql`
	input CreateRouteInput {
		name: String!
		distanceKm: Float
		estimatedTime: String
		active: Boolean
		stations: [CreateStationInput!]
	}

	input UpdateRouteInput {
		name: String
		distanceKm: Float
		estimatedTime: String
		active: Boolean
	}

	input AddStationToRouteInput {
		name: String!
		latitude: Float
		longitude: Float
		sequence: Int
	}

	input StationOrderInput {
		stationId: ID!
		sequence: Int!
	}

	input ReorderStationsInput {
		stationOrder: [StationOrderInput!]!
	}

	input GetRoutesWithUpcomingTripsInput {
		hoursAhead: Int!
	}
`;
