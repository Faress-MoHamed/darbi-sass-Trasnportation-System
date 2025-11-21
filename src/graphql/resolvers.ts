import { tenantResolvers } from "../modules/tenant/graphql/tenant.resolver";
import { createResolvers } from "../helpers/createResolver";
import { authReolver } from "../modules/auth/graphql/auth.resolvers";
import { rbacResolvers } from "../modules/RBAC/graphql/RBAC.resolvers";
const resolvers = createResolvers({
	Query: {
		...tenantResolvers.Query,
		...rbacResolvers.Query,
	},
	Mutation: {
		...tenantResolvers.Mutation,
		...authReolver.Mutation,
		...rbacResolvers.Mutation,
	},
});

export default resolvers;
