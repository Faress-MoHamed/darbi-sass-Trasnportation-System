import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql";
import { getTenantFromToken } from "./helpers/getTenantFromToken";
import { createApolloServer } from "./graphql/createApolloServer";

export async function createApp() {
	const app = express();

	const server = createApolloServer(typeDefs, resolvers);
	await server.start();

	app.use(
		"/graphql",
		cors(),
		express.json(),
		expressMiddleware(server, {
			context: async ({ req }) => {
				const auth = req.headers.authorization;
				let token: string | undefined = undefined;

				if (auth?.startsWith("Bearer ")) {
					token = auth.split(" ")[1];
				}

				const tenant = await getTenantFromToken(token);

				return {
					token,
					tenant,
				};
			},
		})
	);

	return app;
}
