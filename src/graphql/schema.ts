import { authTypeDefs } from "../modules/auth/graphql/auth.typeDefs";
import { RBACTypeDef } from "../modules/RBAC/graphql/RBAC.typeDef";
import { stationTypeDef } from "../modules/stations/graphql/stations.typedef";
import { tenantTypeDefs } from "../modules/tenant/graphql/tenant.typeDefs";
import { mergeTypeDefs } from "@graphql-tools/merge";

const typeDefs = mergeTypeDefs([
	tenantTypeDefs,
	authTypeDefs,
	RBACTypeDef,
	stationTypeDef,
]);

export default typeDefs;
