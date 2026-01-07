import type { DriverStatus } from "@prisma/client";
import {
	protectedTenantResolver,
	safeResolver,
} from "../../../../helpers/safeResolver";
import { DriverService } from "../../drivers.service";
import {
	createDriverSchema,
	type CreateDriverInput,
} from "../../validation/create-driver.validation";
import { ValidationError } from "../../../../errors/ValidationError";
import { AppError } from "../../../../errors/AppError";
import {
	updateDriverSchema,
	type UpdateDriverInput,
} from "../../validation/update-driver.validation";
import { requireRole } from "../../../../helpers/requireRole";

export const DriverMutationResolvers = {
	Mutation: {
		drivers: () => ({}),
	},
	DriverMutation: {
		// Create a new driver
		CuDriver: requireRole(["admin", "super_admin"])(
			protectedTenantResolver(
				async (
					_: any,
					{
						input,
						id,
					}: {
						input: CreateDriverInput | UpdateDriverInput;
						id?: string;
					},
					context
				) => {
					// Validate input
					const service = new DriverService(context.prisma);
					if (!context.tenant?.tenantId) {
						throw new AppError("unauthorized access", 401);
					}
					if (id) {
						const { data: validatedData, error } = updateDriverSchema.safeParse(
							{
								...input,
								tenantId: context.tenant?.tenantId,
							}
						);
						if (error) {
							throw new ValidationError(error, 400);
						}
						return service.CuDriver(
							validatedData,
							context.tenant?.tenantId,
							id
						);
					} else {
						const { data: validatedData, error } = createDriverSchema.safeParse(
							{
								...input,
								tenantId: context.tenant?.tenantId,
							}
						);
						if (error) {
							throw new ValidationError(error, 400);
						}
						return service.CuDriver(validatedData, context.tenant?.tenantId);
					}
				}
			)
		),
		// Delete a driver
		deleteDriver: protectedTenantResolver(
			async (_: any, { id }: { id: string }, context) => {
				const service = new DriverService(context.prisma);
				return service.deleteDriver(id);
			}
		),

		// Update driver status
		updateDriverStatus: protectedTenantResolver(
			async (
				_: any,
				{ id, status }: { id: string; status: DriverStatus },
				context
			) => {
				const service = new DriverService(context.prisma);
				return service.updateDriverStatus(id, status);
			}
		),

		
	},
};
