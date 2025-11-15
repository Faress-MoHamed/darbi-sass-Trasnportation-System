import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import http from "http";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql";
import { getTenantFromToken } from "./helpers/getTenantFromToken";
import { createApolloServer } from "./graphql/createApolloServer";

export default async function createServer() {
	const app = express();
	const httpServer = http.createServer(app);

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

	return new Promise<string>((resolve) => {
		httpServer.listen(8080, () => resolve("http://localhost:8080"));
	});
}
