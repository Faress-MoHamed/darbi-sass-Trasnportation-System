import { AppError } from "../errors/AppError";
import type { ResolverContext } from "../types/ResolverTypes";

export function requireRole(allowedRoles: string[]) {
	return (resolver: any) => {
		return (parent: any, args: any, context: ResolverContext, info: any) => {
			if (!context.user) {
				throw new AppError("Unauthorized", 401);
			}

			if (
				(context.user.role !== "SuperAdmin" &&
					!allowedRoles.includes(context.userRole?.name || "")) ||
				context.user.status !== "active" ||
				context.user.deletedAt !== null
			) {
				throw new AppError(
					"You do not have permission to perform this action",
					403
				);
			}

			return resolver(parent, args, context, info);
		};
	};
}
