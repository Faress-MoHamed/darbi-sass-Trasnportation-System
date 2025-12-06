import gql from "graphql-tag";

export default gql`
	type RoutesQuery {
		getRoutes(id: ID, meta: PaginationArgs, filters: Filters): RoutePagination
		getRoute(routeId: ID!): Route
		getRouteWithTrips(
			routeId: ID!
			tripStatus: TripStatus
		): RouteWithActiveTrips
		getRoutesWithUpcomingTrips(
			params: GetRoutesWithUpcomingTripsInput!
		): [RouteWithActiveTrips!]!
	}

	type Query {
		routes: RoutesQuery
	}
`;
