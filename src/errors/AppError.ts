import { GraphQLError } from "graphql";

export class AppError extends GraphQLError {
	constructor(
		message: string,
		statusCode = 500,
		isOperational = true
	) {
		super(message, {
			extensions: {
				status: statusCode,
				isOperational,
			},
		});
	}
}
