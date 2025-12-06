import { driverTypes } from "./driver.type.gql";
import { driverEnums } from "./driver.enum.gql";
import { driverInputs } from "./driver.input.gql";
import { driverPagination } from "./driver.pagination.gql";
import { driverQueries } from "./driver.queries.gql";
import { driverMutations } from "./driver.mutations.gql";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { driverStatistics } from "./driver.statistics.gql";

export const driverTypeDefs = mergeTypeDefs([
	driverQueries,
	driverMutations,
	driverTypes,
	driverEnums,
	driverInputs,
	driverPagination,
	driverStatistics,
]);
