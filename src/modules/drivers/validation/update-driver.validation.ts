import { z } from "zod";
import { licenseSchema } from "./license.validation";

// Update driver input validation schema
export const updateDriverSchema = z
	.object({
		// User data
		name: z.string().max(150, "Name must not exceed 150 characters"),
		phone: z
			.string()

			.max(20, "Phone must not exceed 20 characters"),
		password: z.string().optional(),
		confirmPassword: z.string().optional(),

		email: z
			.string()
			.email("Invalid email format")
			.max(150, "Email must not exceed 150 characters")
			.nullable()
			.optional(),

		licenseNumber: licenseSchema.optional(),

		status: z.enum(["available", "unavailable", "offline"]).optional(),
		rating: z
			.number()
			.min(0, "Rating must be at least 0")
			.max(5, "Rating must not exceed 5")
			.optional(),
	})
	.refine(
		(data) =>
			data.password === data.confirmPassword &&
			data.password &&
			data.confirmPassword,
		{
			message: "Passwords do not match",
			path: ["confirmPassword"],
		}
	);

export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;

// Validates update driver input data
export function validateUpdateDriver(data: unknown) {
	return updateDriverSchema.safeParse(data);
}
