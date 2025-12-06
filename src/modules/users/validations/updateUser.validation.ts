import { TenantStatus, UserRoleEnum, UserStatus } from "@prisma/client";
import z from "zod";

export const updateUserSchema = z.object({
	id: z.string().uuid(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	name: z.string().optional(),
	password: z.string().min(6).optional(),
	role: z.nativeEnum(UserRoleEnum).optional(),
	status: z.nativeEnum(UserStatus).optional(),
	mustChangePassword: z.boolean().optional(),
	// Add other fields you want to allow updating here
});
