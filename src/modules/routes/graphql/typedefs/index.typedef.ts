import gql from "graphql-tag";
import { mergeTypeDefs } from "@graphql-tools/merge";

import enums from "./enums.graphql";
import types from "./types.graphql";
import inputs from "./inputs.graphql";
import queries from "./queries.graphql";
import mutations from "./mutations.graphql";

export const RouteTypeDef = mergeTypeDefs([
	enums,
	types,
	inputs,
	queries,
	mutations,
]);
