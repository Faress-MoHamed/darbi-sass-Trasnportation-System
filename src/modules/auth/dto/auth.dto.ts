import { z } from "zod";

export const LoginDto = z.object({
	phone: z.string().min(1, "Phone is required"),
	password: z.string().optional(),
});

export const RefreshTokenDto = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});

export const ForgetPasswordDto = z.object({
	phone: z.string().min(1, "Phone is required"),
});

export const LoginUserForFirstTimeDto = z.object({
	phone: z.string().min(1, "Phone is required"),
});

export const VerifyOtpDto = z.object({
	phone: z.string().min(1, "Phone is required"),
	otp: z.string().min(1, "OTP is required"),
});

export const ResetPasswordDto = z
	.object({
		token: z.string().min(1, "Token is required"),
		newPassword: z.string().min(6, "Password must be at least 6 characters"),
		ConfirmnewPassword: z
			.string()
			.min(6, "Confirm Password must be at least 6 characters"),
	})
	.superRefine((data, ctx) => {
		if (data.newPassword !== data.ConfirmnewPassword) {
			ctx.addIssue({
				code: "custom",
				message: "Passwords do not match",
				path: ["ConfirmnewPassword"],
			});
		}
	});
