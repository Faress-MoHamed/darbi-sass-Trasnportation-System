import { tenantResolvers } from "../modules/tenant/graphql/tenant.resolver";
import { createResolvers } from "../helpers/createResolver";
import { authReolver } from "../modules/auth/graphql/auth.resolvers";
import { rbacResolvers } from "../modules/RBAC/graphql/RBAC.resolvers";
import { mergeResolvers } from "@graphql-tools/merge";
const resolvers = mergeResolvers([tenantResolvers, rbacResolvers, authReolver]);
export default resolvers;
