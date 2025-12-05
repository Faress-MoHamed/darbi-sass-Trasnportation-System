import { Request, Response, NextFunction } from "express";
import { RBACService } from "../modules/RBAC/index.service";
import type { ResolverContext, ResolverFn } from "../types/ResolverTypes";
import { AppError } from "../errors/AppError";
import type { PermissionKey } from "../helpers/permissionhelper";

export const requirePermission = (permissionKey: PermissionKey) => {
	return (resolver: ResolverFn) => {
		return async (
			parent: any,
			args: any,
			context: ResolverContext,
			info: any
		) => {
			const { userId, prisma, user } = context;

			if (!userId) throw new AppError("Unauthorized", 401);

			const service = new RBACService(prisma);
			const ok = await service.hasPermission(userId, permissionKey);

			if (!ok&&user?.role!=="SuperAdmin") throw new AppError("Forbidden", 403);

			return resolver(parent, args, context, info);
		};
	};
};
