import { ValidationError } from "../../../errors/ValidationError";
import { createResolvers } from "../../../helpers/createResolver";
import { AuthService } from "../auth.service";
import {
	LoginDto,
	RefreshTokenDto,
	ForgetPasswordDto,
	LoginUserForFirstTimeDto,
	VerifyOtpDto,
	ResetPasswordDto,
} from "../dto/auth.dto";

const authModule = new AuthService();

export const authResolver = createResolvers({
	Mutation: {
		auth: () => ({}), // Returns empty object for namespace
	},
	AuthMutations: {
		login: async (_: any, args) => {
			const result = LoginDto.safeParse(args.input);
			if (!result.success) {
				throw new ValidationError(result.error);
			}
			if (!result.data.password) {
				return authModule.LoginUserForFirstTime(result.data.phone);
			} else {
				return authModule.login(result.data.phone, result.data.password);
			}
		},

		logout: async (_: any, _args: any, context) => {
			return authModule.logout(context.token!);
		},

		refreshToken: async (_: any, args) => {
			const result = RefreshTokenDto.safeParse(args.input);
			if (!result.success) {
				throw new ValidationError(result.error);
			}
			return authModule.refreshToken(result.data.refreshToken);
		},

		forgetPassword: async (_: any, args) => {
			const result = ForgetPasswordDto.safeParse(args.input);
			if (!result.success) {
				throw new ValidationError(result.error);
			}
			return authModule.forgetPassword(result.data.phone);
		},
		resendOtp: async (_: any, args) => {
			const result = ForgetPasswordDto.safeParse(args.input);
			if (!result.success) {
				throw new ValidationError(result.error);
			}
			return authModule.resendOtp(result.data.phone);
		},
		verifyOtp: async (_: any, args) => {
			const result = VerifyOtpDto.safeParse(args.input);
			if (!result.success) {
				throw new ValidationError(result.error);
			}
			return authModule.VerifyOtpFromUser(result.data.phone, result.data.otp);
		},
		VerifyPhone: async (_: any, args) => {
			const result = VerifyOtpDto.safeParse(args.input);
			if (!result.success) {
				throw new ValidationError(result.error);
			}
			return authModule.VerifyPhone(result.data.otp, result.data.phone);
		},
		resetPassword: async (_: any, args) => {
			const result = ResetPasswordDto.safeParse(args.input);
			if (!result.success) {
				throw new ValidationError(result.error);
			}
			return authModule.resetPassword(
				result.data.token,
				result.data.newPassword,
				result.data.ConfirmnewPassword
			);
		},
	},
});
