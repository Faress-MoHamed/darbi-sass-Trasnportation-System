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
import { UserService } from "./modules/users/users.services";
import "graphql-import-node/register";
import { TenantService } from "./modules/tenant/tenant.service";

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
				const tenantId = req.headers["x-tenant-id"] as string | undefined;
				if (auth?.startsWith("Bearer ")) {
					token = auth.split(" ")[1];
				}
				const tenant = await new TenantService().getOneTenant(tenantId);
				const user = await new UserService().findByToken(token);
				const userRole = await PrismaForDev(
					tenant?.id,
					user?.id
				).userRole.findFirst({
					where: {
						userId: user?.id,
						tenantId: tenant?.id,
					},
					select: {
						role: true,
					},
				});
				

				return {
					token,
					tenant: { ...tenant, tenantId: tenant?.id },
					userId: user?.id,
					prisma: PrismaForDev(tenant?.id, user?.id), // نمرّر tenant.id هنا
					user,
					userRole: userRole?.role,
				};
			},
		})
	);

	return new Promise<string>((resolve) => {
		httpServer.listen(8080, () => resolve("http://localhost:8080/graphql"));
	});
}
