import { tenantResolvers } from "../modules/tenant/graphql/tenant.resolver";
import { createResolvers } from "../helpers/createResolver";
import { authResolver } from "../modules/auth/graphql/auth.resolvers";
import { rbacResolvers } from "../modules/RBAC/graphql/index.resolvers";
import { busResolvers } from "../modules/buses/graphql/resolvers/bus.resolver";
import { mergeResolvers } from "@graphql-tools/merge";
import { stationResolvers } from "../modules/stations/graphql/stations.resolvers";
import RoutesResolvers from "../modules/routes/graphql/resolvers/index.resolvers";
import { DriverResolvers } from "../modules/drivers/graphql/resolver/index.resolver";
import { bookingResolvers } from "../modules/Booking/graphql/resolvers/index.resolver";
import { TripResolvers } from "../modules/Trip/graphql/resolvers";
const resolvers = mergeResolvers([
	tenantResolvers,
	rbacResolvers,
	authResolver,
	stationResolvers,
	RoutesResolvers,
	DriverResolvers,
	busResolvers,
	bookingResolvers,
	TripResolvers,
]);
export default resolvers;
