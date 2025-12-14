import { TokenService } from "./token.service";
import { OtpService } from "./otp.service";
import { AuthErrorService } from "./authError.service";
import { LogService } from "../../services/log.service";
import { UserService } from "../users/users.services";
import {
	PrismaClient,
	UserRoleEnum,
	UserStatus,
	type Prisma,
} from "@prisma/client";
import { AppError } from "../../errors/AppError";
import { BadRequestError } from "../../errors/BadRequestError";
import { prisma } from "../../lib/prisma";
import { checkObjectInModelExistOrFail } from "../../helpers/checkObjectInModelExist";
import type { RegisterDto } from "./validation/registerValidation";

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
			user.id
		);

		await this.userService.updateLastLogin(user.id);

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
	async Register(
		input: RegisterDto & { role?: UserRoleEnum },
		prismaTx?: PrismaClient | Prisma.TransactionClient,
		tenantId?: string
	) {
		let PrismaModule = prismaTx || prisma;
		const { name, phone, password, email } = input;
		const user = await this.userService.createUser(
			{
				name,
				phone,
				password,
				email: email || null,
				role: input.role || null,
				status: "pending",
				phoneVerified: false,
				mustChangePassword: false,
			},
			PrismaModule.user,
			tenantId
		);
		await this.otpService.sendOtp(phone, user.id, prismaTx);
		return {
			success: true,
			message: "User registered successfully. OTP sent to phone.",
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

		await this.otpService.sendOtp(phone, user.id);

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
		const user = await prisma.otp.findFirst({
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
					},
				},
			},
		});
		if (!user) AuthErrorService.throwUserNotFound();
		await this.userService.updatePassword(user.userId, newPassword);

		// حذف كل توكنات الدخول
		// هنا نستخدم prisma مباشرة أو ممكن تنقل ل TokenService revokeTokenByUserId لو ضفتها
		await prisma.accessToken.deleteMany({ where: { userId: user.userId } });
		await prisma.otp.deleteMany({ where: { userId: user.userId } });

		return { success: true, message: "Password reset successfully" };
	}

	async logout(token: string) {
		await this.tokenService.revokeToken(token);
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
		this.otpService.sendOtp(phone, user.id);
		return {
			success: true,
			message: "otp sended successfully",
		};
	}

	async resendOtp(phone: string) {
		const user = await checkObjectInModelExistOrFail(
			prisma.user,
			"phone",
			phone,
			"user not exist"
		);
		return this.otpService.resendOtp(phone, user.id);
	}

	async VerifyOtpFromUser(phone: string, otp: string) {
		const user = await checkObjectInModelExistOrFail(
			prisma.user,
			"phone",
			phone,
			"user not exist"
		);
		const codeData = await this.otpService.verifyOtp(otp, user.id);
		const { token } = await this.tokenService.createOtpTokens(codeData);

		return {
			success: true,
			message: "OTP sent is valid",
			token,
		};
	}
	async VerifyPhone(otp: string, phone: string) {
		const Validateuser = await checkObjectInModelExistOrFail(
			prisma.user,
			"phone",
			phone,
			"user not exist"
		);
		const codeData = await this.otpService.verifyOtp(otp, Validateuser.id);
		await prisma.user.update({
			where: { id: codeData.userId },
			data: { status: "active", mustChangePassword: false },
		});
		const user = await checkObjectInModelExistOrFail(
			prisma.user,
			"id",
			codeData.userId,
			"user not exist"
		);
		const { token, refreshToken } = await this.tokenService.createTokens(
			codeData.userId
		);
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
}
