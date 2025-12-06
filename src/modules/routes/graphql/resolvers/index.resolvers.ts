import { RouteQueryResolvers } from "./query.resolvers";
import { mutationResolvers } from "./mutations.resolvers";
import { createResolvers } from "../../../../helpers/createResolver";

const RoutesResolvers = createResolvers({
	Query: {
		routes: () => ({}), // Namespace for route queries
	},
	Mutation: {
		route: () => ({}), // Namespace for route mutations
	},
	RoutesQuery: RouteQueryResolvers,
	RouteMutation: mutationResolvers,
});
export default RoutesResolvers;
