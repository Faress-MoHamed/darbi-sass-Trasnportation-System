import { GraphQLError, type GraphQLFormattedError } from "graphql";
import { AppError } from "../errors/AppError";

export function graphqlErrorFormatter(
	formattedError: GraphQLFormattedError,
	error: any
) {
	console.error(
		"⚡ GraphQL Error:",
		{ error: error },
		formattedError
	);

	return {
		status: formattedError.extensions?.status || 500,
		message: formattedError.message || "Internal Server Error",
	};
}
