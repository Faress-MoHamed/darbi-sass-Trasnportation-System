import { tenantResolvers } from "../modules/tenant/graphql/tenant.resolver";
import { createResolvers } from "../helpers/createResolver";
import { authResolver } from "../modules/auth/graphql/auth.resolvers";
import { rbacResolvers } from "../modules/RBAC/graphql/RBAC.resolvers";
import { driverResolvers } from "../modules/drivers/graphql/driver.resolver";
import { mergeResolvers } from "@graphql-tools/merge";
import { stationResolvers } from "../modules/stations/graphql/stations.resolvers";
const resolvers = mergeResolvers([
    tenantResolvers,
    rbacResolvers,
    authResolver,
    stationResolvers,
    driverResolvers,
]);
export default resolvers;
