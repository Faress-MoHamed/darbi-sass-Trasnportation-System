import type { Tenant, User } from "@prisma/client";
import { createUserSchema } from "../../users/validations/create-user.validation";
import { AppError } from "../../../errors/AppError";
import { createTenantSchema } from "../validation/create-tenant.validation";

export type CreateTenant = {
	tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt"> & {
		id?: string;
	};

	user: User;
};
export type CreateTenantPayload = Omit<
	Tenant,
	"id" | "createdAt" | "updatedAt"
> & {
	id?: string;

	user: User;
};

export function createTenantInput(args: CreateTenantPayload): CreateTenant {
	console.log("Validating user:", args.user);

	const { error: tenantError, data: tenantData } =
		createTenantSchema.safeParse(args);

	if (tenantError) {
		throw new AppError(tenantError.message, 400);
	}
	return {
		tenantData: {
			id: args?.id,
			name: tenantData.name,
			planType: tenantData.planType ?? "basic",
			status: tenantData.status ?? "suspended",
		},

		user: args.user as any,
	};
}
