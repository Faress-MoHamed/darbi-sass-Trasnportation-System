import { tenantTypeDefs } from "../modules/tenant/graphql/tenant.typeDefs";
import { mergeTypeDefs } from "@graphql-tools/merge";

const typeDefs = mergeTypeDefs([ tenantTypeDefs]);

export default typeDefs;
