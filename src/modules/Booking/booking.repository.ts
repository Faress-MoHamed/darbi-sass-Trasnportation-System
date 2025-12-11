import { PrismaClient, BookingStatus, Prisma } from "@prisma/client";

interface FindManyParams {
	tenantId: string;
	userId?: string;
	tripId?: string;
	status?: BookingStatus;
	startDate?: Date;
	endDate?: Date;
	skip?: number;
	take?: number;
}

export class BookingRepository {
	constructor(private prisma: PrismaClient) {}

	async create(data: Prisma.BookingCreateInput) {
		return this.prisma.booking.create({
			data,
			include: {
				user: true,
				trip: {
					include: {
						route: true,
						bus: true,
					},
				},
			},
		});
	}

	async findById(id: string, tenantId: string) {
		return this.prisma.booking.findFirst({
			where: {
				id,
				tenantId,
				deletedAt: null,
			},
			include: {
				user: true,
				trip: {
					include: {
						route: true,
						bus: true,
					},
				},
				payment: true,
				tickets: true,
				customFieldValues: {
					include: {
						customField: true,
					},
				},
			},
		});
	}

	async findByTicketNumber(ticketNumber: string, tenantId: string) {
		return this.prisma.booking.findFirst({
			where: {
				ticketNumber,
				tenantId,
				deletedAt: null,
			},
			include: {
				user: true,
				trip: {
					include: {
						route: true,
						bus: true,
					},
				},
			},
		});
	}

	async findMany(params: FindManyParams) {
		const { tenantId, userId, tripId, status, startDate, endDate, skip, take } =
			params;

		const where: Prisma.BookingWhereInput = {
			tenantId,
			deletedAt: null,
			...(userId && { userId }),
			...(tripId && { tripId }),
			...(status && { status }),
			...(startDate &&
				endDate && {
					bookingDate: {
						gte: startDate,
						lte: endDate,
					},
				}),
		};

		const [bookings, total] = await Promise.all([
			this.prisma.booking.findMany({
				where,
				skip,
				take,
				orderBy: { bookingDate: "desc" },
				include: {
					user: true,
					trip: {
						include: {
							route: true,
							bus: true,
						},
					},
					payment: true,
				},
			}),
			this.prisma.booking.count({ where }),
		]);

		return { bookings, total };
	}

	async update(id: string, tenantId: string, data: Prisma.BookingUpdateInput) {
		return this.prisma.booking.update({
			where: { id },
			data: {
				...data,
			},
			include: {
				user: true,
				trip: true,
				payment: true,
			},
		});
	}

	async cancel(id: string, tenantId: string) {
		return this.update(id, tenantId, {
			status: "cancelled",
		});
	}

	async hasDuplicateBooking(
		userId: string,
		tripId: string,
		tenantId: string
	): Promise<boolean> {
		const count = await this.prisma.booking.count({
			where: {
				userId,
				tripId,
				tenantId,
				status: {
					in: ["pending", "confirmed"],
				},
				deletedAt: null,
			},
		});

		return count > 0;
	}

	async isSeatAvailable(
		tripId: string,
		seatNumber: string,
		tenantId: string
	): Promise<boolean> {
		const count = await this.prisma.booking.count({
			where: {
				tripId,
				seatNumber,
				tenantId,
				status: {
					in: ["pending", "confirmed"],
				},
				deletedAt: null,
			},
		});

		return count === 0;
	}

	async countTripBookings(
		tripId: string,
		tenantId: string,
		status?: "confirmed"
	): Promise<number> {
		return this.prisma.booking.count({
			where: {
				tripId,
				tenantId,
				...(status && { status }),
				deletedAt: null,
			},
		});
	}

	async getBookedSeats(tripId: string, tenantId: string): Promise<string[]> {
		const bookings = await this.prisma.booking.findMany({
			where: {
				tripId,
				tenantId,
				status: {
					in: ["pending", "confirmed"],
				},
				seatNumber: {
					not: null,
				},
				deletedAt: null,
			},
			select: {
				seatNumber: true,
			},
		});

		return bookings
			.map((b) => b.seatNumber)
			.filter((s): s is string => s !== null);
	}

	async generateTicketNumber(tenantId: string): Promise<string> {
		const count = await this.prisma.booking.count({
			where: { tenantId },
		});

		const timestamp = Date.now().toString().slice(-6);
		const sequence = (count + 1).toString().padStart(4, "0");

		return `TKT-${timestamp}-${sequence}`;
	}

	async getUserBookings(
		userId: string,
		tenantId: string,
		params?: {
			status?: BookingStatus;
			skip?: number;
			take?: number;
		}
	) {
		const { status, skip, take } = params || {};

		return this.prisma.booking.findMany({
			where: {
				userId,
				tenantId,
				...(status && { status }),
				deletedAt: null,
			},
			skip,
			take,
			orderBy: { bookingDate: "desc" },
			include: {
				trip: {
					include: {
						route: true,
						bus: true,
					},
				},
				payment: true,
			},
		});
	}

	async getUpcomingBookings(
		userId: string,
		tenantId: string,
		limit: number = 5
	) {
		return this.prisma.booking.findMany({
			where: {
				userId,
				tenantId,
				status: "confirmed",
				trip: {
					departureTime: {
						gte: new Date(),
					},
				},
				deletedAt: null,
			},
			take: limit,
			orderBy: {
				trip: {
					departureTime: "asc",
				},
			},
			include: {
				trip: {
					include: {
						route: true,
						bus: true,
					},
				},
			},
		});
	}

}