import { Request, Response, NextFunction } from "express";
import { RBACService } from "../modules/RBAC/index.service";
import type { ResolverFn } from "../types/ResolverTypes";
import { AppError } from "../errors/AppError";
import type { PermissionKey } from "../helpers/permissionhelper";

export const requirePermission = (permissionKey: PermissionKey) => {
  return (resolver: ResolverFn) => {
    return async (parent: any, args: any, context: any, info: any) => {
      const { userId, prisma } = context;

      if (!userId) throw new AppError("Unauthorized", 401);

      const service = new RBACService(prisma);
      const ok = await service.hasPermission(userId, permissionKey);

      if (!ok) throw new AppError("Forbidden", 403);

      return resolver(parent, args, context, info);
    };
  };
};

