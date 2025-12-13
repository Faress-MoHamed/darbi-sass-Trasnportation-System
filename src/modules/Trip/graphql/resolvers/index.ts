import { tripMutations } from "./index.mutations.resolver";
import { tripQueries } from "./index.queries.resolver";

export const TripResolvers = {
	...tripQueries,

	...tripMutations,
};
