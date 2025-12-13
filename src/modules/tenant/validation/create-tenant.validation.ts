import {  TenantStatus } from "@prisma/client";
import { z } from "zod";

export const TenantStatusEnum = z.nativeEnum(TenantStatus);

export const createTenantSchema = z.object({
	name: z.string().max(150, "Name must be 150 characters or less"),
	status: TenantStatusEnum.optional(), // لو هتستخدمه
});

// Infer Type
export type CreateTenantInput = z.infer<typeof createTenantSchema>;

// ============================================================================
// Update Tenant Schema
// ============================================================================

export const updateTenantSchema = z.object({
	// Usually update allows partial fields
	name: z.string().max(150).optional(),
});

// Infer Type
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
