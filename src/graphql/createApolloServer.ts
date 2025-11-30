import { ApolloServer } from "@apollo/server";
import { graphqlErrorFormatter } from "./graphqlErrorFormatter";
import type { DocumentNode } from "graphql";
import resolvers from "./resolvers";
import type { ResolverContext } from "../types/ResolverTypes";

type resolverTypee = typeof resolvers;

export function createApolloServer(
	typeDefs: DocumentNode,
	resolvers: resolverTypee
) {
	return new ApolloServer<ResolverContext>({
		typeDefs,
		resolvers,
		formatError: graphqlErrorFormatter,
	});
}
