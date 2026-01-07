import gql from "graphql-tag";

export default gql`
	type RouteMutation {
		createRoute(input: CreateRouteInput!): RouteWithStations!
		updateRoute(routeId: ID!, input: UpdateRouteInput!): RouteWithStations!
		disactivateRoute(routeId: ID!): Route!
		deleteRoute(routeId: [ID!]!): Route
		addStationToRoute(routeId: ID!, input: AddStationToRouteInput!): Station!
		reorderStations(routeId: ID!, input: ReorderStationsInput!): [Station!]!
		reorderStationsByProximity(routeId: ID!): [Station!]!
		toggleRouteStatus(routeId: ID!): Route!
	}

	type Mutation {
		route: RouteMutation
	}
`;
