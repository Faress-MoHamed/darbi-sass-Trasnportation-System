import { tenantResolvers } from "../modules/tenant/graphql/tenant.resolver";
import { createResolvers } from "../helpers/createResolver";
import { authResolver } from "../modules/auth/graphql/auth.resolvers";
import { rbacResolvers } from "../modules/RBAC/graphql/index.resolvers";
import { driverResolvers } from "../modules/drivers/graphql/driver.resolver";
import { busResolvers } from "../modules/buses/graphql/bus.resolver";
import { mergeResolvers } from "@graphql-tools/merge";
import { stationResolvers } from "../modules/stations/graphql/stations.resolvers";
import RoutesResolvers from "../modules/routes/graphql/routes.resolvers";
const resolvers = mergeResolvers([
	tenantResolvers,
	rbacResolvers,
	authResolver,
	stationResolvers,
	RoutesResolvers,
	driverResolvers,
	busResolvers,
]);
export default resolvers;
