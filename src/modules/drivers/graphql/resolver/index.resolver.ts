import { createResolvers } from "../../../../helpers/createResolver";
import { DriverMutationResolvers } from "./mutations.resolvers";
import { DriverQueryResolvers } from "./query.resolvers";

export const DriverResolvers = createResolvers({
	...DriverMutationResolvers,
	...DriverQueryResolvers,
});
