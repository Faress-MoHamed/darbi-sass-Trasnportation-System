import { TokenService } from "./token.service";
import { OtpService } from "./otp.service";
import { AuthErrorService } from "./authError.service";
import { LogService } from "../../services/log.service";
import { UserService } from "../users/users.services";
import { PrismaClient } from "@prisma/client";

export class AuthService {
	private userService = new UserService();
	private tokenService = new TokenService();
	private logService = new LogService();
  private prisma = new PrismaClient();
  private otpService = new OtpService()

	async login(phone: string, password?: string, otpCode?: string) {
		const user = await this.userService.findByPhoneWithTenant(phone);
		if (!user) AuthErrorService.throwInvalidCredentials();

		if (user.status === "banned") AuthErrorService.throwAccountBanned();
		if (user.status === "pending") AuthErrorService.throwAccountPending();

		if (otpCode) {
			this.otpService.verifyOtp(phone, otpCode);
		} else if (password) {
			if (!user.password) {
				throw new Error("Password login not available for this account");
			}
			const valid = await this.userService.verifyPassword(
				password,
				user.password
			);
			if (!valid) AuthErrorService.throwInvalidCredentials();
		} else {
			throw new Error("Either password or OTP is required");
		}

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
		if (user.status !== "active") AuthErrorService.throwUserNotActive();

		await this.otpService.sendOtp(phone, user.tenantId, user.id);

		return { success: true, message: "OTP sent to your phone number" };
	}

	async resetPassword(phone: string, otpCode: string, newPassword: string) {
		this.otpService.verifyOtp(phone, otpCode);

		const user = await this.userService.findByPhone(phone);
		if (!user) AuthErrorService.throwUserNotFound();

		await this.userService.updatePassword(user.id, newPassword);

		// حذف كل توكنات الدخول
		// هنا نستخدم prisma مباشرة أو ممكن تنقل ل TokenService revokeTokenByUserId لو ضفتها
		await this.prisma.accessToken.deleteMany({ where: { userId: user.id } });

		await this.logService.logAction({
			tenantId: user.tenantId,
			userId: user.id,
			action: "PASSWORD_RESET",
			entityType: "User",
			entityId: user.id,
		});

		return { success: true, message: "Password reset successfully" };
	}

	async logout(token: string) {
		await this.tokenService.revokeToken(token);
		// من الأفضل الحصول على بيانات التوكن قبل الحذف للتسجيل في اللوج
		// أو تعديل revokeToken لتعيد بيانات التوكن المحذوفة
		// هنا مجرد مثال
		await this.logService.logAction({
			tenantId: "", // ضع هنا بيانات المؤجر واليوزر إن حصلت عليها
			userId: "",
			action: "USER_LOGOUT",
			entityType: "User",
			entityId: "",
		});

		return { success: true, message: "Logged out successfully" };
	}
}
