import { ValidationError } from "../../../errors/ValidationError";
import { createResolvers } from "../../../helpers/createResolver";
import { AuthService } from "../auth.service";
import { loginSchema } from "../validation/login.validation";

const authModule = new AuthService();

export const authReolver = createResolvers({
	Mutation: {
		Auth: {
			login: async (_parent, _args) => {
				const result = loginSchema.safeParse(_args.input);
				if (!result.success) {
					throw new ValidationError(result.error);
				}
				return authModule.login(result.data.phone, result.data.password);
			},
			logout: async (_parent, args, context) => {
				console.log({ context });
				return authModule.logout(context.token);
			},
			refreshToken: async (_params, args, context) => {
				return authModule.refreshToken(args.input.refreshToken);
			},
			forgetPassword: async (_params, args) => {
				return authModule.forgetPassword(args.input.phone);
			},
			LoginUserForFirstTime: async (_parent, args, context) => {
				await authModule.LoginUserForFirstTime(args?.input?.phone);
			},
			VerifyOtp: async (_parent, args, context) => {
				await authModule.VerifyOtpFromUser(
					args?.input?.phone,
					args?.input?.otp
				);
			},

			resetPassword: async (_parent, args, context) => {
				await authModule.resetPassword(
					args?.input?.token,
					args?.input?.newPassword,
					args?.input?.ConfirmnewPassword
				);
			},
    },
    
	},
});
