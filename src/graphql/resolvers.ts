import { tenantResolvers } from "../modules/tenant/graphql/tenant.resolver";
import { createResolvers } from "../helpers/createResolver";
import { authReolver } from "../modules/auth/graphql/auth.resolvers";
const resolvers = createResolvers({
	Query: {
		...tenantResolvers.Query,
	},
	Mutation: {
		...tenantResolvers.Mutation,
		...authReolver.Mutation,
	},
});

export default resolvers;
