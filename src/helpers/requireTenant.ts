import { AppError } from "../errors/AppError";
import type { ResolverContext } from "../types/ResolverTypes";

/**
 * Ensure tenant context exists
 */
export function requireTenant(context: ResolverContext): string {
  if (!context.tenant?.tenantId) {
    throw new AppError("Unauthorized access", 401);
  }
  return context.tenant.tenantId;
}