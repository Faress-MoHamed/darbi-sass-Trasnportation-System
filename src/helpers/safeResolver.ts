import { ZodError } from "zod";
import { handleZodError } from "../errors/handleZodError";
import { AppError } from "../errors/AppError";
import type { ResolverFn, ResolversMap } from "../types/ResolverTypes";

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

export function wrapResolversWithSafeResolver(obj: ResolversMap) {
	const wrapped: ResolversMap = {};

	for (const key in obj) {
		wrapped[key] = {};

		for (const field in obj[key]) {
			const value = obj[key][field];

			// If field contains nested resolvers (ex: Mutation.Auth)
			if (typeof value === "object" && !("length" in value)) {
				wrapped[key][field] = {};

				for (const innerField in value) {
					wrapped[key][field][innerField] = safeResolver(value[innerField]);
				}
			} else {
				wrapped[key][field] = safeResolver(value);
			}
		}
	}

	return wrapped;
}
