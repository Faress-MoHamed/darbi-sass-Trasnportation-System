import { GraphQLError, type GraphQLFormattedError } from "graphql";
import { AppError } from "../errors/AppError";

export function graphqlErrorFormatter(formattedError: GraphQLFormattedError, error: any) {
  console.error("⚡ GraphQL Error:", error);

  if (error.originalError instanceof AppError) {
    return {
      message: error.originalError.message,
      statusCode: error.originalError.statusCode,
      path: formattedError.path,
    };
  }
  return {
    message: "Internal Server Error",
    statusCode: 500,
    path: formattedError.path,
  };
}
