import { GraphQLError, type GraphQLFormattedError } from "graphql";
import { AppError } from "../errors/AppError";

export function graphqlErrorFormatter(
	formattedError: GraphQLFormattedError,
	error: any
) {
	console.error("⚡ GraphQL Error:", error);

	if (error.originalError instanceof AppError) {
		return {
			status: error.originalError.status,
			message: error.originalError.message,
		};
	}

	return {
		status: 500,
		message: "Internal Server Error",
	};
}
