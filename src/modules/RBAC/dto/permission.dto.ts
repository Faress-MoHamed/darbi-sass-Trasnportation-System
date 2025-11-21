import { z } from "zod";

export interface CreatePermissionDTO {
	key: string;
	description?: string;
}

export interface UpdatePermissionDTO {
	key?: string;
	description?: string;
}

export const CreatePermissionSchema = z.object({
	key: z.string().min(1, "Key is required"),
	description: z.string().optional(),
});

export const UpdatePermissionSchema = z.object({
	key: z.string().optional(),
	description: z.string().optional(),
});
