import { TokenService } from "./token.service";
import { OtpService } from "./otp.service";
import { AuthErrorService } from "./authError.service";
import { LogService } from "../../services/log.service";
import { UserService } from "../users/users.services";
import { PrismaClient, UserStatus } from "@prisma/client";
import { AppError } from "../../errors/AppError";
import { BadRequestError } from "../../errors/BadRequestError";
import { prisma } from "../../lib/prisma";
import { checkObjectInModelExistOrFail } from "../../helpers/checkObjectInModelExist";

export class AuthService {
	private userService = new UserService();
	private tokenService = new TokenService();
	private logService = new LogService();
	private otpService = new OtpService();

	async login(phone: string, password: string) {
		const user = await this.userService.findByPhoneWithTenant(phone);
		if (!user) AuthErrorService.throwInvalidCredentials();

		if (user.status === UserStatus.banned)
			AuthErrorService.throwAccountBanned();
		if (user.status === "pending") AuthErrorService.throwAccountPending();

		if (!user.password) {
			throw new Error("Password login not available for this account");
		}

		const valid = await this.userService.verifyPassword(
			password,
			user.password
		);
		if (!valid) AuthErrorService.throwInvalidCredentials();

		const { token, refreshToken } = await this.tokenService.createTokens(
			user.id,
			user.tenantId
		);

		await this.userService.updateLastLogin(user.id);

		await this.logService.logAction({
			tenantId: user.tenantId,
			userId: user.id,
			action: "USER_LOGIN",
			entityType: "User",
			entityId: user.id,
		});

		return {
			token,
			refreshToken,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				role: user.role,
			},
			mustChangePassword: user.mustChangePassword,
		};
	}

	async refreshToken(refreshToken: string) {
		return this.tokenService.refreshToken(refreshToken);
	}

	async forgetPassword(phone: string) {
		const user = await this.userService.findByPhone(phone);
		if (!user) {
			// Do not reveal user existence
			return {
				success: true,
				message: "If the phone number exists, an OTP has been sent",
			};
		}
		if (user.status !== UserStatus.active)
			AuthErrorService.throwUserNotActive();

		await this.otpService.sendOtp(phone, user.tenantId, user.id);

		return { success: true, message: "OTP sent to your phone number" };
	}

	async resetPassword(
		token: string,
		newPassword: string,
		ConfirmnewPassword: string
	) {
		if (newPassword.trim() !== ConfirmnewPassword.trim()) {
			throw new BadRequestError();
		}
		const user = await prisma.otpToken.findFirst({
			where: {
				token: {
					equals: token,
				},
			},
			select: {
				userId: true,
				user: {
					select: {
						id: true,
						tenantId: true,
					},
				},
			},
		});
		if (!user) AuthErrorService.throwUserNotFound();
		console.log({ user, newPassword });
		await this.userService.updatePassword(user.userId, newPassword);

		// حذف كل توكنات الدخول
		// هنا نستخدم prisma مباشرة أو ممكن تنقل ل TokenService revokeTokenByUserId لو ضفتها
		await prisma.accessToken.deleteMany({ where: { userId: user.user?.id } });
		await prisma.otpToken.deleteMany({ where: { userId: user.user?.id } });

		await this.logService.logAction({
			tenantId: user.user?.tenantId,
			userId: user.userId,
			action: "PASSWORD_RESET",
			entityType: "User",
			entityId: user.userId,
		});

		return { success: true, message: "Password reset successfully" };
	}

	async logout(token: string) {
		await this.tokenService.revokeToken(token);
		const existingUser = await prisma.user.findFirst({
			where: {
				accessTokens: {
					every: {
						token,
					},
				},
			},
		});
		if (existingUser) {
			await this.logService.logAction({
				tenantId: existingUser?.tenantId,
				userId: existingUser?.id,
				action: "USER_LOGOUT",
				entityType: "User",
				entityId: "",
			});
		}

		return { success: true, message: "Logged out successfully" };
	}

	async LoginUserForFirstTime(phone: string) {
		const user = await this.userService.findByPhoneWithTenant(phone);
		if (!user?.mustChangePassword) {
			throw new AppError(
				"you ar signed already if you forget your password go to forgetPassword",
				400
			);
		}
		this.otpService.sendOtp(phone, user.tenantId, user.id);
		return {
			success: true,
			message: "otp sended successfully",
		};
	}

	async VerifyOtpFromUser(phone: string, otp: string) {
		await this.otpService.verifyOtp(otp);
		const user = await checkObjectInModelExistOrFail(
			prisma.user,
			"phone",
			phone,
			"user not exist"
		);
		const { token } = await this.tokenService.createOtpTokens(user?.id);
		return {
			success: true,
			message: "otp sended is Valid",
			token,
		};
	}
}
