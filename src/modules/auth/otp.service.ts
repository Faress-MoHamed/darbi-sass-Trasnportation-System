import { TwilioService } from "./twilio.service";
import { AuthErrorService } from "./authError.service";
import { LogService } from "../../services/log.service";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { checkObjectInModelExistOrFail } from "../../helpers/checkObjectInModelExist";

interface OtpStore {
	[phone: string]: { code: string; expiresAt: Date; attempts: number };
}

export class OtpService {
	private otpStore: OtpStore = {};
	private readonly OTP_EXPIRY_MINUTES = 5;
	private readonly MAX_OTP_ATTEMPTS = 3;
	private logService = new LogService();
	private twilioService = new TwilioService();

	private generateOtpCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	async sendOtp(phone: string, 	 userId: string) {
		const otpCode = this.generateOtpCode();
		const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);
		await prisma.otp.create({
			data: {
				userId,
				expiresAt,
				code: otpCode,
			},
		});

		await this.twilioService.sendWhatsApp(
			phone,
			`Your verification code is: ${otpCode}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`
		);

		await this.logService.logAction({
			userId,
			action: "OTP_SENT",
			entityType: "User",
			entityId: userId,
		});
	}

	async verifyOtp(code: string) {
		const otpData = await checkObjectInModelExistOrFail(
			prisma.otp,
			"code",
			code,
			"OTP not found for this phone number"
		);
		if (otpData.attempts >= this.MAX_OTP_ATTEMPTS) {
			await prisma.otp.delete({
				where: { id: otpData.id },
			});
			AuthErrorService.throwMaxOtpAttemptsExceeded();
		}
		await prisma.otp.update({
			where: { id: otpData.id },
			data: { attempts: { increment: 1 } },
		});

		if (new Date() > otpData.expiresAt) {
			await prisma.otp.delete({
				where: { id: otpData.id },
			});
			AuthErrorService.throwOtpExpired();
		}

		if (otpData.code !== code) AuthErrorService.throwInvalidOtp();

		await prisma.otp.delete({
			where: { id: otpData.id },
		});
	}
}
