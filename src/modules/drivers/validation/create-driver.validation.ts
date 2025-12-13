import { z } from "zod";
import { licenseSchema } from "./license.validation";

// Create driver input validation schema
export const createDriverSchema = z.object({
	// User data
	name: z
		.string()
		.min(1, "Name is required")
		.max(150, "Name must not exceed 150 characters"),
	phone: z
		.string()
		.min(1, "Phone is required")
		.max(20, "Phone must not exceed 20 characters"),
	email: z
		.string()
		.email("Invalid email format")
		.max(150, "Email must not exceed 150 characters")
		.nullable()
		.optional(),

	// Driver-specific data
	licenseNumber: licenseSchema,

	status: z
		.enum(["available", "unavailable", "offline"])
		.default("offline")
		.optional(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;

// Validates create driver input data
export function validateCreateDriver(data: unknown) {
	return createDriverSchema.safeParse(data);
}
