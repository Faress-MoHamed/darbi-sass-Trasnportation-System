import { TwilioService } from "./twilio.service";
import { AuthErrorService } from "./authError.service";
import { LogService } from "../../services/log.service";

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

	async sendOtp(phone: string, tenantId: string, userId: string) {
		const otpCode = this.generateOtpCode();
		const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

		this.otpStore[phone] = { code: otpCode, expiresAt, attempts: 0 };

		await this.twilioService.sendWhatsApp(
			phone,
			`Your verification code is: ${otpCode}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`
		);

		await this.logService.logAction({
			tenantId,
			userId,
			action: "OTP_SENT",
			entityType: "User",
			entityId: userId,
		});
	}

	verifyOtp(phone: string, code: string) {
		const otpData = this.otpStore[phone];

		if (!otpData)
			AuthErrorService.throwGenericError(
				"OTP not found. Please request a new one."
			);

		if (otpData.attempts >= this.MAX_OTP_ATTEMPTS) {
			delete this.otpStore[phone];
			AuthErrorService.throwMaxOtpAttemptsExceeded();
		}

		otpData.attempts++;

		if (new Date() > otpData.expiresAt) {
			delete this.otpStore[phone];
			AuthErrorService.throwOtpExpired();
		}

		if (otpData.code !== code) AuthErrorService.throwInvalidOtp();

		delete this.otpStore[phone];
	}
}
