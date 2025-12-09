import { createResolvers } from "../../../../helpers/createResolver";
import { busMutationsResolvers } from "./mutations.resolver";
import { busQueriesResolvers } from "./queries.resolver";

export const busResolvers = createResolvers({
	BusQueries: busQueriesResolvers,
	Query: {
		buses: () => ({}),
	},
	Mutation: {
		buses: () => ({}),
	},
	BusMutations: busMutationsResolvers,
});
