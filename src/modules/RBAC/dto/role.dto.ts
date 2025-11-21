import z from "zod";

export interface CreateRoleDTO {
	name: string;
	description?: string;
	permissionIds: number[];
}

export interface UpdateRoleDTO {
	name?: string;
	description?: string;
	permissionIds?: number[];
}

export const CreateRoleSchema = z.object({
	name: z.string().min(1, "Role name is required"),
	description: z.string().optional(),
	permissionIds: z
		.array(z.number().int())
		.min(1, "At least one permission is required"),
});

export const UpdateRoleSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
	permissionIds: z.array(z.number().int()).optional(),
});
