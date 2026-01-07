import { AppError } from "../errors/AppError";
import type { ResolverContext } from "../types/ResolverTypes";

export function requireRole(allowedRoles: RoleType[]) {
	return (resolver: any) => {
		return async (
			parent: any,
			args: any,
			context: ResolverContext,
			info: any
		) => {
			if (!context.user) {
				throw new AppError("Unauthorized", 401);
			}

			if (context.user.status !== "active" || context.user.deletedAt !== null) {
				throw new AppError("Account is not active", 403);
			}

			// SuperAdmin bypass
			if (context.user.role === "SuperAdmin") {
				return resolver(parent, args, context, info);
			}

			const hasRole = await userHasRoleInTenant({
				userId: context.userId!,
				tenantId: context.tenant?.tenantId!,
				roleTypes: allowedRoles,
			});

			if (!hasRole) {
				throw new AppError(
					"You do not have permission to perform this action",
					403
				);
			}

			return resolver(parent, args, context, info);
		};
	};
}

import { PrismaClient, type RoleType } from "@prisma/client";

interface CheckUserRoleInput {
	userId: string;
	tenantId: string;
	roleTypes: RoleType[];
}

export async function userHasRoleInTenant({
	userId,
	tenantId,
	roleTypes,
}: CheckUserRoleInput): Promise<boolean> {
	const prisma = new PrismaClient();
	const userRole = await prisma.userRole.findFirst({
		where: {
			userId,
			tenantId,
			deletedAt: null,
			role: {
				type: {
					in: roleTypes,
				},
				deletedAt: null,
			},
		},
		select: {
			roleId: true,
		},
	});

	return Boolean(userRole);
}
