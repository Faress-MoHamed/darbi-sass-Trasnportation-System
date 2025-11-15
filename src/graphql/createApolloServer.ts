import { ApolloServer } from "@apollo/server";
import { graphqlErrorFormatter } from "./graphqlErrorFormatter";
import type { DocumentNode } from "graphql";
import resolvers from "./resolvers";

type resolverTypee = typeof resolvers;

export function createApolloServer(
	typeDefs: DocumentNode,
	resolvers: resolverTypee
) {
	return new ApolloServer({
		typeDefs,
		resolvers,
		formatError: graphqlErrorFormatter,
	});
}
