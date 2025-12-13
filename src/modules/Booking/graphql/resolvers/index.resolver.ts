import { bookingQueries } from "./index.queries.resolver";
import { bookingMutations } from "./index.mutations.resolver";

export const bookingResolvers = {
	...bookingQueries,

	...bookingMutations,
};
