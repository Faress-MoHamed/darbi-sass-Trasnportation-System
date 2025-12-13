import { bookingEnums } from "./booking.enums";
import { bookingTypes } from "./booking.types";
import { bookingInputs } from "./booking.inputs";
import { bookingQueries } from "./booking.queries";
import { bookingMutations } from "./booking.mutations";
import { mergeTypeDefs } from "@graphql-tools/merge";

export const bookingTypeDefs = mergeTypeDefs([
	bookingEnums,
	bookingTypes,
	bookingInputs,
	bookingQueries,
	bookingMutations,
]);
