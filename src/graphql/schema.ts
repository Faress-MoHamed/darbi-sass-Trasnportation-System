import { authTypeDefs } from "../modules/auth/graphql/auth.typeDefs";
import { tenantTypeDefs } from "../modules/tenant/graphql/tenant.typeDefs";
import { mergeTypeDefs } from "@graphql-tools/merge";

const typeDefs = mergeTypeDefs([tenantTypeDefs, authTypeDefs]);

export default typeDefs;
