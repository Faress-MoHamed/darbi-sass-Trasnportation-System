import { ZodError } from "zod";
import { handleZodError } from "../errors/handleZodError";
import { AppError } from "../errors/AppError";
import type {
	ResolverFn,
	ResolversMap,
	TenantContext,
} from "../types/ResolverTypes";
import { requireTenant } from "./requireTenant";

export function safeResolver(resolverFn: ResolverFn) {
	return async (parent: any, args: any, context: any, info: any) => {
		try {
			return await resolverFn(parent, args, context, info);
		} catch (error: any) {
			if (error instanceof ZodError) throw handleZodError(error);
			if (error instanceof AppError) throw error;

			console.error("Unexpected Error:", error);

			throw new AppError(error?.message || "Internal Server Error", 500);
		}
	};
}

export function protectedTenantResolver<Parent = any, Args = any, Result = any>(
	resolver: ResolverFn<Parent, Args, TenantContext, Result>
) {
	return safeResolver(requireTenant(resolver));
}
