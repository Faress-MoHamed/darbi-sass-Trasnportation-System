import { tenantResolvers } from "../modules/tenant/graphql/tenant.resolver";
import { createResolvers } from "../helpers/createResolver";
const resolvers = createResolvers({
	Query: {
		...tenantResolvers.Query,
	},
	Mutation: {
		...tenantResolvers.Mutation,
	},
});

export default resolvers;
