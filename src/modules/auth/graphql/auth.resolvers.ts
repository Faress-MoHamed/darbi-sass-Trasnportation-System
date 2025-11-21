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

export const authReolver = createResolvers({
	Mutation: {
		login: async (_parent, _args) => {
			const result = LoginDto.safeParse(_args.input);
			if (!result.success) {
				throw new ValidationError(result.error);
			}

			return authModule.login(result.data.phone, result.data.password);
		},

		logout: async (_parent, _args, context) => {
			return authModule.logout(context.token!);
		},

		refreshToken: async (_parent, args) => {
			const result = RefreshTokenDto.safeParse(args.input);

			if (!result.success) {
				throw new ValidationError(result.error);
			}

			return authModule.refreshToken(result.data.refreshToken);
		},

		forgetPassword: async (_parent, args) => {
			const result = ForgetPasswordDto.safeParse(args.input);

			if (!result.success) {
				throw new ValidationError(result.error);
			}

			return authModule.forgetPassword(result.data.phone);
		},

		LoginUserForFirstTime: async (_parent, args) => {
			const result = LoginUserForFirstTimeDto.safeParse(args.input);

			if (!result.success) {
				throw new ValidationError(result.error);
			}

			return authModule.LoginUserForFirstTime(result.data.phone);
		},

		VerifyOtp: async (_parent, args) => {
			const result = VerifyOtpDto.safeParse(args.input);

			if (!result.success) {
				throw new ValidationError(result.error);
			}

			return authModule.VerifyOtpFromUser(result.data.phone, result.data.otp);
		},

		resetPassword: async (_parent, args) => {
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
