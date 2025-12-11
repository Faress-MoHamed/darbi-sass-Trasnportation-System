import { authTypeDefs } from "../modules/auth/graphql/auth.typeDefs";
import { RBACTypeDef } from "../modules/RBAC/graphql/index.typeDef";
import { RouteTypeDef } from "../modules/routes/graphql/typedefs/index.typedef";
import { stationTypeDef } from "../modules/stations/graphql/stations.typedef";
import { tenantTypeDefs } from "../modules/tenant/graphql/tenant.typeDefs";
import { driverTypeDefs } from "../modules/drivers/graphql/typedef";
import { busTypeDefs } from "../modules/buses/graphql/typedefs/index.schema";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { userTypeDefs } from "../modules/users/graphql/index.typedef";
import { bookingTypeDefs } from "../modules/Booking/graphql/typedefs/index.typedef";
import { TripTypeDefs } from "../modules/Trip/graphql/index.typedef";

const typeDefs = mergeTypeDefs([
	tenantTypeDefs,
	authTypeDefs,
	RBACTypeDef,
	stationTypeDef,
	RouteTypeDef,
	userTypeDefs,
	TripTypeDefs,

	driverTypeDefs,
	busTypeDefs,
	bookingTypeDefs,
]);

export default typeDefs;
