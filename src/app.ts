import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import http from "http";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql";
import { getTenantFromToken } from "./helpers/getTenantFromToken";
import { createApolloServer } from "./graphql/createApolloServer";
import { PrismaForDev } from "./lib/prisma";
import type { ApolloServer } from "@apollo/server";
import type { ResolverContext } from "./types/ResolverTypes";

export default async function createServer() {
	const app = express();
	const httpServer = http.createServer(app);

	const server = createApolloServer(typeDefs, resolvers);
	await server.start();

	app.use(
		"/graphql",
		cors(),
		express.json(),
		expressMiddleware(server as ApolloServer<ResolverContext>, {
			context: async ({ req }) => {
				const auth = req.headers.authorization;
				let token: string | undefined = undefined;

				if (auth?.startsWith("Bearer ")) {
					token = auth.split(" ")[1];
				}

				const tenant = await getTenantFromToken(token);
				console.log({ tenant });
				return {
					token,
					tenant,
					userId: tenant?.userId,
					prisma: PrismaForDev(tenant?.tenantId, tenant?.userId), // نمرّر tenant.id هنا
				};
			},
		})
	);

	return new Promise<string>((resolve) => {
		httpServer.listen(8080, () => resolve("http://localhost:8080/graphql"));
	});
}
