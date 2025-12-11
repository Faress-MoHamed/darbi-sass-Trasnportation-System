import { PrismaClient } from "@prisma/client";
import { BookingRepository } from "../booking.repository";
import QRCode from "qrcode";
import path from "path";
import { mkdir } from "fs/promises";
import { AppError } from "../../../errors/AppError";

export class BookingsTicketService {
	private bookingRepository: BookingRepository;
	private prisma: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("PrismaClient instance is required");
		}
		this.prisma = prisma;
		this.bookingRepository = new BookingRepository(prisma);
	}

	async generateTicket(bookingId: string, tenantId: string) {
		const booking = await this.bookingRepository.findById(bookingId, tenantId);

		if (!booking) {
			return;
		}

		const qrPayload = this.prepareQRPayload(booking);
		const qrString = JSON.stringify(qrPayload);

		const fileName = await this.generateQRCode(qrString, booking.id);

		await this.saveTicketRecord(tenantId, bookingId, fileName);
	}

	private prepareQRPayload(booking: any) {
		return {
			bookingId: booking.id,
			ticketNumber: booking.ticketNumber,
			userId: booking.userId,
			tripId: booking.tripId,
			seatNumber: booking.seatNumber,
		};
	}

	private async generateQRCode(
		qrString: string,
		bookingId: string
	): Promise<string> {
		const qrDir = path.resolve(__dirname, "../../qrcodes");

		try {
			await mkdir(qrDir, { recursive: true });
		} catch (err: any) {
			if (err.code !== "EEXIST") {
				throw err;
			}
		}

		const fileName = `ticket_${bookingId}.png`;
		const filePath = path.join(qrDir, fileName);

		await QRCode.toFile(filePath, qrString, {
			width: 300,
			margin: 2,
		});

		return fileName;
	}

	private async saveTicketRecord(
		tenantId: string,
		bookingId: string,
		fileName: string
	) {
		await this.prisma.ticket.create({
			data: {
				tenantId,
				bookingId,
				qrCode: fileName,
				issuedAt: new Date(),
			},
		});
	}
}
