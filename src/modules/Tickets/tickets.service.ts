import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";
import path from "path";
import { mkdir } from "fs/promises";
import { BookingRepository } from "../Booking/booking.repository";

export class TicketService {
	private bookingRepository: BookingRepository;

	constructor(private prisma: PrismaClient) {
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
