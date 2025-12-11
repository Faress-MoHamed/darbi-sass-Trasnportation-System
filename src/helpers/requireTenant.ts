import { AppError } from "../errors/AppError";
import type { ResolverContext, ResolverFn, TenantContext } from "../types/ResolverTypes";

export function requireTenant<Parent = any, Args = any, Result = any>(
	resolver: ResolverFn<Parent, Args, TenantContext, Result>
): ResolverFn<Parent, Args, ResolverContext, Result> {
	return async (parent, args, ctx: ResolverContext, info) => {
		if (!ctx.tenant?.tenantId) {
			throw new AppError("Tenant ID is required", 400);
		}

		const nextCtx: TenantContext = {
			...ctx,
			tenant: ctx.tenant, // tenant is now guaranteed
			tenantId: ctx.tenant.tenantId,
		};

		return resolver(parent, args, nextCtx, info);
	};
}
