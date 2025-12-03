import { authTypeDefs } from "../modules/auth/graphql/auth.typeDefs";
import { RBACTypeDef } from "../modules/RBAC/graphql/index.typeDef";
import { RouteTypeDef } from "../modules/routes/graphql/routes.typedef";
import { stationTypeDef } from "../modules/stations/graphql/stations.typedef";
import { tenantTypeDefs } from "../modules/tenant/graphql/tenant.typeDefs";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { userTypeDefs } from "../modules/user/graphql/index.typedef";
import { BookingTypeDefs } from "../modules/Booking/graphql/index.typedef";
import { TripTypeDefs } from "../modules/Trip/graphql/index.typedef";

const typeDefs = mergeTypeDefs([
	tenantTypeDefs,
	authTypeDefs,
	RBACTypeDef,
	stationTypeDef,
	RouteTypeDef,
	userTypeDefs,
	BookingTypeDefs,
	TripTypeDefs,
]);

export default typeDefs;
