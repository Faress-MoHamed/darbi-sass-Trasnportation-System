import { Twilio } from "twilio";

export class TwilioService {
  private client?: Twilio;
  private phoneNumber?: string;

  configure(config: { accountSid: string; authToken: string; phoneNumber: string }) {
    this.client = new Twilio(config.accountSid, config.authToken);
    this.phoneNumber = config.phoneNumber;
  }

  private ensureConfigured() {
    if (!this.client || !this.phoneNumber) {
      throw new Error("Twilio client not configured.");
    }
  }

  async sendSms(to: string, body: string) {
    this.ensureConfigured();
    return this.client!.messages.create({
      from: this.phoneNumber!,
      to,
      body,
    });
  }
}
