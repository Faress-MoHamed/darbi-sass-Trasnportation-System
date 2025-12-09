import { PrismaClient, Bus, BusStatus, Prisma } from "@prisma/client";
import type { PaginationArgs } from "../../helpers/pagination";
import { PaginatedAndFilterService } from "../../services/Filters.service";

// Bus Repository
export class BusRepository {
	constructor(private prisma: PrismaClient) {}

	// ============================================================================
	// Basic CRUD Operations
	// ============================================================================

	async create(data: Prisma.BusCreateInput) {
		return await this.prisma.bus.create({
			data,
			include: {
				tenant: true,
			},
		});
	}

	async findById(id: string) {
		return await this.prisma.bus.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			include: {
				tenant: true,
			},
		});
	}

	async findByIdWithTrips(id: string) {
		return await this.prisma.bus.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			include: {
				trips: {
					where: {
						status: { in: ["in_progress", "boarding", "scheduled", "delayed"] },
						deletedAt: null,
					},
				},
			},
		});
	}

	async findByBusNumber(busNumber: string) {
		return await this.prisma.bus.findFirst({
			where: {
				busNumber,
				deletedAt: null,
			},
			include: {
				tenant: true,
			},
		});
	}

	async findByBusNumberExcludingId(busNumber: string, excludeId: string) {
		return await this.prisma.bus.findFirst({
			where: {
				busNumber,
				deletedAt: null,
				id: { not: excludeId },
			},
		});
	}

	async findAll(meta?: PaginationArgs) {
		return await new PaginatedAndFilterService(
			this.prisma.bus
		).filterAndPaginate(meta);
	}

	async findByStatus(status?: BusStatus) {
		return await this.prisma.bus.findMany({
			where: {
				deletedAt: null,
				...(status && { status }),
			},
			include: {
				tenant: true,
			},
			orderBy: {
				busNumber: "asc",
			},
		});
	}

	async findActiveBuses() {
		return await this.prisma.bus.findMany({
			where: {
				status: "active",
				deletedAt: null,
			},
		});
	}

	async findMaintenanceBuses() {
		return await this.prisma.bus.findMany({
			where: {
				status: "maintenance",
				deletedAt: null,
			},
			include: {
				tenant: true,
			},
		});
	}

	async update(id: string, data: Prisma.BusUpdateInput) {
		return await this.prisma.bus.update({
			where: { id },
			data,
			include: {
				tenant: true,
			},
		});
	}

	async softDelete(id: string) {
		return await this.prisma.bus.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	async hardDelete(id: string) {
		return await this.prisma.bus.delete({
			where: { id },
		});
	}

	async restore(id: string) {
		return await this.prisma.bus.update({
			where: { id },
			data: { deletedAt: null },
			include: {
				tenant: true,
			},
		});
	}

	async findDeleted(id: string) {
		return await this.prisma.bus.findFirst({
			where: { id },
		});
	}

	// ============================================================================
	// GPS & Location Operations
	// ============================================================================

	async findLatestGpsData(busId: string) {
		return await this.prisma.gpsData.findFirst({
			where: { busId, deletedAt: null },
			orderBy: { timestamp: "desc" },
		});
	}

	async findGpsHistory(busId: string, startDate?: Date, endDate?: Date) {
		const dateFilter: any = { busId, deletedAt: null };
		if (startDate || endDate) {
			dateFilter.timestamp = {};
			if (startDate) dateFilter.timestamp.gte = startDate;
			if (endDate) dateFilter.timestamp.lte = endDate;
		}

		return await this.prisma.gpsData.findMany({
			where: dateFilter,
			orderBy: { timestamp: "desc" },
		});
	}

	// ============================================================================
	// Trip Operations
	// ============================================================================

	async findActiveTrips(busId: string) {
		return await this.prisma.trip.findMany({
			where: {
				busId,
				status: { in: ["in_progress", "boarding", "scheduled", "delayed"] },
				deletedAt: null,
			},
			include: {
				route: true,
				driver: {
					include: {
						user: true,
					},
				},
			},
			orderBy: {
				departureTime: "asc",
			},
		});
	}

	async findTripHistory(busId: string, limit: number = 50) {
		return await this.prisma.trip.findMany({
			where: {
				busId,
				deletedAt: null,
			},
			include: {
				route: true,
				driver: {
					include: {
						user: true,
					},
				},
			},
			orderBy: {
				departureTime: "desc",
			},
			take: limit,
		});
	}

	async countConflictingTrips(busId: string, startTime: Date, endTime: Date) {
		return await this.prisma.trip.count({
			where: {
				busId,
				status: { in: ["in_progress", "boarding", "scheduled", "delayed"] },
				deletedAt: null,
				OR: [
					{
						AND: [
							{ departureTime: { lte: startTime } },
							{ arrivalTime: { gte: startTime } },
						],
					},
					{
						AND: [
							{ departureTime: { lte: endTime } },
							{ arrivalTime: { gte: endTime } },
						],
					},
					{
						AND: [
							{ departureTime: { gte: startTime } },
							{ arrivalTime: { lte: endTime } },
						],
					},
				],
			},
		});
	}

	async findBusesWithActiveTrips(busIds: string[]) {
		return await this.prisma.bus.findMany({
			where: {
				id: { in: busIds },
				deletedAt: null,
			},
			include: {
				trips: {
					where: {
						status: { in: ["in_progress", "boarding", "scheduled", "delayed"] },
						deletedAt: null,
					},
				},
			},
		});
	}

	// ============================================================================
	// Status Log Operations
	// ============================================================================

	async createStatusLog(busId: string, status: BusStatus) {
		await this.prisma.busStatusLog.create({
			data: {
				busId,
				status:
					status === "active"
						? "active"
						: status === "maintenance"
						? "maintenance"
						: "stopped",
			},
		});
	}

	// ============================================================================
	// Bulk Operations
	// ============================================================================

	async bulkUpdateStatus(busIds: string[], status: BusStatus) {
		const result = await this.prisma.bus.updateMany({
			where: {
				id: { in: busIds },
				deletedAt: null,
			},
			data: { status },
		});

		return result.count;
	}

	async bulkSoftDelete(busIds: string[]) {
		const result = await this.prisma.bus.deleteMany({
			where: {
				id: { in: busIds },
				deletedAt: null,
			},
		});

		return result.count;
	}
}
