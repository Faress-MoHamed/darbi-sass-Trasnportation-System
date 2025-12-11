import { PrismaClient } from "@prisma/client";
import { BookingRepository } from "../booking.repository";
import { BookingsTicketService } from "./bookingTickets.service";
import { AppError } from "../../../errors/AppError";
// import { LoyaltyService } from "./loyalty.service";
// import { NotificationService } from "./notification.service";

interface ProcessPaymentDTO {
	bookingId: string;
	tenantId: string;
	paymentMethodId: string;
	amount: number;
}

export class PaymentService {
	private bookingRepository: BookingRepository;
	private ticketService: BookingsTicketService;
	// private loyaltyService: LoyaltyService;
	// private notificationService: NotificationService;
	private prisma: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("PrismaClient instance is required");
		}
		this.prisma = prisma;
		this.bookingRepository = new BookingRepository(prisma);
		this.ticketService = new BookingsTicketService(prisma);
		// this.loyaltyService = new LoyaltyService(prisma);
		// this.notificationService = new NotificationService(prisma);
	}

	async processPayment(dto: ProcessPaymentDTO) {
		const { bookingId, tenantId, paymentMethodId, amount } = dto;

		const booking = await this.bookingRepository.findById(bookingId, tenantId);
		if (!booking) {
			throw new Error("Booking not found");
		}

		if (booking.status !== "pending") {
			throw new Error("Booking is not in pending state");
		}

		const paymentMethod = await this.getPaymentMethod(
			paymentMethodId,
			booking.userId!,
			tenantId
		);

		const payment = await this.createPaymentRecord(
			tenantId,
			booking.userId!,
			bookingId,
			amount,
			paymentMethod
		);

		try {
			const paymentResult = await this.processPaymentGateway(
				payment,
				paymentMethod
			);

			if (paymentResult.success) {
				await this.handleSuccessfulPayment(
					payment.id,
					paymentResult.transactionId,
					bookingId,
					tenantId,
					booking.userId!,
					amount
				);

				return {
					success: true,
					booking: await this.bookingRepository.findById(bookingId, tenantId),
					payment,
				};
			} else {
				await this.handleFailedPayment(payment.id);
				throw new Error(paymentResult.message || "Payment failed");
			}
		} catch (error) {
			await this.handleFailedPayment(payment.id);
			throw error;
		}
	}

	async processRefund(bookingId: string, tenantId: string) {
		const booking = await this.bookingRepository.findById(bookingId, tenantId);

		if (!booking || !booking.paymentId || !booking.payment) {
			return;
		}

		if (booking.payment.status !== "success") {
			return;
		}

		await this.prisma.payment.update({
			where: { id: booking.paymentId },
			data: { status: "refunded" },
		});
	}

	private async getPaymentMethod(
		paymentMethodId: string,
		userId: string,
		tenantId: string
	) {
		const paymentMethod = await this.prisma.paymentMethod.findFirst({
			where: {
				id: paymentMethodId,
				userId,
				tenantId,
				deletedAt: null,
			},
		});

		if (!paymentMethod) {
			throw new Error("Payment method not found");
		}

		return paymentMethod;
	}

	private async createPaymentRecord(
		tenantId: string,
		userId: string,
		bookingId: string,
		amount: number,
		paymentMethod: any
	) {
		return this.prisma.payment.create({
			data: {
				tenantId,
				userId,
				amount,
				method: paymentMethod.type === "wallet" ? "wallet" : "card",
				provider: paymentMethod.provider,
				status: "pending",
				reference: `BOOK-${bookingId}`,
			},
		});
	}

	private async processPaymentGateway(payment: any, paymentMethod: any) {
		// Mock implementation - replace with actual payment gateway integration
		return {
			success: true,
			transactionId: `TXN-${Date.now()}`,
			message: "Payment processed successfully",
		};
	}

	private async handleSuccessfulPayment(
		paymentId: string,
		transactionId: string,
		bookingId: string,
		tenantId: string,
		userId: string,
		amount: number
	) {
		await this.prisma.payment.update({
			where: { id: paymentId },
			data: {
				status: "success",
				transactionId,
			},
		});

		await this.bookingRepository.update(bookingId, tenantId, {
			status: "confirmed",
			payment: { connect: { id: paymentId } },
		});

		await this.ticketService.generateTicket(bookingId, tenantId);
		// await this.loyaltyService.awardBookingPoints(userId, tenantId, amount);
		// await this.notificationService.sendBookingConfirmation(bookingId, tenantId);
	}

	private async handleFailedPayment(paymentId: string) {
		await this.prisma.payment.update({
			where: { id: paymentId },
			data: { status: "failed" },
		});
	}
}
