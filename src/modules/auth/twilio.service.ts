import { Twilio } from "twilio";
import twilio from "twilio";

// Twilio Configuration
interface TwilioConfig {
	accountSid: string;
	authToken: string;
	whatsappNumber: string; // Your Twilio WhatsApp number (e.g., 'whatsapp:+14155238886')
}
export class TwilioService {
	phoneNumber = "+14155238886";
	private twilioClient: twilio.Twilio | null = null;
	private twilioConfig: TwilioConfig;

	constructor() {
		// Load from environment variables
		this.twilioConfig = {
			accountSid: "AC326012aa50191b669595ed5971f3727f",
			authToken: "f3a9f72373bedd781059f2ae683cb430",
			whatsappNumber: "whatsapp:+14155238886",
		};
	}
	private initializeTwilioService() {
		if (this.twilioConfig.accountSid && this.twilioConfig.authToken) {
			this.twilioClient = twilio(
				this.twilioConfig.accountSid,
				this.twilioConfig.authToken
			);
		} else {
			console.warn(
				"Twilio WhatsApp service not configured. Please set TWILIO env variables."
			);
		}
	}
	async sendSms(to: string, body: string) {
		this.initializeTwilioService();
		return this.twilioClient!.messages.create({
			from: this.phoneNumber!,
			to,
			body,
		});
	}
	async sendWhatsApp(to: string, body: string) {
		this.initializeTwilioService();
		return this.twilioClient!.messages.create({
			from: this.twilioConfig.whatsappNumber,
			to: `whatsapp:${to}`, // e.g. whatsapp:+1234567890
			body,
		});
	}
}
