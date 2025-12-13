import z from "zod";

export const RegisterSchema = z
	.object({
		phone: z
			.string()
			.min(8, "Phone number must be at least 8 characters") // adjust min length as needed
			.max(20, "Phone number must be at most 20 characters")
			.regex(
				/^\+?\d+$/,
				"Phone number must contain only digits and optional leading +"
			),
		name: z
			.string()
			.min(2, "Name must be at least 2 characters")
			.max(100, "Name must be at most 100 characters"),
		email: z
      .string()
      .email("Invalid email address")
			.nullable(),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(100, "Password must be at most 100 characters"),
		confirmPassword: z
			.string()
			.min(8, "Confirm Password must be at least 8 characters")
			.max(100, "Confirm Password must be at most 100 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
	});


export type RegisterDto = z.infer<typeof RegisterSchema>;
