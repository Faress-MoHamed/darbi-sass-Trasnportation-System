import { PrismaClient, Bus, BusStatus } from "@prisma/client";
import { AppError } from "../../errors/AppError";
import {
	createBusSchema,
	CreateBusInput,
} from "./validation/create-bus.validation";
import {
	updateBusSchema,
	UpdateBusInput,
} from "./validation/update-bus.validation";
import { BusFiltersDto, PaginationDto, BusListDto } from "./dto/bus.dto";
import type { PaginationArgs, PaginationMeta } from "../../helpers/pagination";
import { PaginatedAndFilterService } from "../../services/Filters.service";

// Bus Service
// Handles all business logic for bus management
export class BusService {
	constructor(private prisma: PrismaClient) {}

	// Validates that a bus number is unique within a tenant
	async validateBusNumberUniqueness(
		busNumber: string,
		tenantId: string,
		excludeBusId?: string
	): Promise<void> {
		const existingBus = await this.prisma.bus.findFirst({
			where: {
				busNumber,
				tenantId,
				...(excludeBusId && { id: { not: excludeBusId } }),
			},
		});

		if (existingBus) {
			throw new AppError(
				`Bus number '${busNumber}' already exists in this tenant`,
				400
			);
		}
	}

	// Creates a new bus
	async createBus(
		data: CreateBusInput,
		contextTenantId?: string
	): Promise<Bus> {
		// Validate input
		const validation = createBusSchema.safeParse(data);
		if (!validation.success) {
			throw new AppError(
				`Validation failed: ${validation.error.issues
					.map((e: any) => e.message)
					.join(", ")}`,
				400
			);
		}

		const validatedData = validation.data;

		// Ensure we have tenantId from context
		if (!contextTenantId) {
			throw new AppError(
				"Authentication required. Please login to create a bus.",
				401
			);
		}

		// Check bus number uniqueness within tenant
		await this.validateBusNumberUniqueness(
			validatedData.busNumber,
			contextTenantId
		);

		// Create bus
		const bus = await this.prisma.bus.create({
			data: {
				tenantId: contextTenantId,
				busNumber: validatedData.busNumber,
				capacity: validatedData.capacity,
				type: validatedData.type,
				status: validatedData.status || "stopped",
				gpsTrackerId: validatedData.gpsTrackerId,
				maintenanceStatus: validatedData.maintenanceStatus,
			},
			include: {
				tenant: true,
			},
		});

		return bus;
	}

	// Gets a bus by ID
	async getBusById(id: string): Promise<Bus | null> {
		const bus = await this.prisma.bus.findUnique({
			where: { id },
			include: {
				tenant: true,
			},
		});

		if (!bus) {
			return null;
		}

		return bus;
	}

	// Lists buses with optional filters and pagination
	async listBuses(meta?: PaginationArgs) {
		return await new PaginatedAndFilterService(
			this.prisma.bus
		).filterAndPaginate(meta);
	}

	// Updates a bus
	async updateBus(id: string, data: UpdateBusInput): Promise<Bus> {
		// Validate input
		const validation = updateBusSchema.safeParse(data);
		if (!validation.success) {
			throw new AppError(
				`Validation failed: ${validation.error.issues
					.map((e: any) => e.message)
					.join(", ")}`,
				400
			);
		}

		const validatedData = validation.data;

		// Check if bus exists
		const existingBus = await this.prisma.bus.findUnique({
			where: { id },
		});

		if (!existingBus) {
			throw new AppError("Bus not found", 404);
		}

		// If bus number is being updated, check uniqueness
		if (
			validatedData.busNumber &&
			validatedData.busNumber !== existingBus.busNumber
		) {
			await this.validateBusNumberUniqueness(
				validatedData.busNumber,
				existingBus.tenantId,
				id
			);
		}

		// Update bus
		const updatedBus = await this.prisma.bus.update({
			where: { id },
			data: validatedData,
			include: {
				tenant: true,
			},
		});

		return updatedBus;
	}

	// Updates bus status (active/maintenance/stopped)
	async updateBusStatus(
		id: string,
		status: BusStatus,
		maintenanceStatus?: string
	): Promise<Bus> {
		// Check if bus exists
		const existingBus = await this.prisma.bus.findUnique({
			where: { id },
		});

		if (!existingBus) {
			throw new AppError("Bus not found", 404);
		}

		// Update status
		const updatedBus = await this.prisma.bus.update({
			where: { id },
			data: {
				status,
				...(maintenanceStatus !== undefined && { maintenanceStatus }),
			},
			include: {
				tenant: true,
			},
		});

		return updatedBus;
	}

	// Deletes a bus
	async deleteBus(id: string): Promise<boolean> {
		// Check if bus exists
		const existingBus = await this.prisma.bus.findUnique({
			where: { id },
			include: {
				trips: {
					where: {
						status: "active",
					},
				},
			},
		});

		if (!existingBus) {
			throw new AppError("Bus not found", 404);
		}

		// Check if bus has active trips
		if (existingBus.trips && existingBus.trips.length > 0) {
			throw new AppError(
				"Cannot delete bus with active trips. Please complete or cancel all active trips first.",
				400
			);
		}

		// Delete bus
		await this.prisma.bus.delete({
			where: { id },
		});

		return true;
	}

	// Gets bus statistics
	async getBusStatistics(busId: string) {
		// Check if bus exists
		const bus = await this.prisma.bus.findUnique({
			where: { id: busId },
		});

		if (!bus) {
			throw new AppError("Bus not found", 404);
		}

		// Get trip statistics
		const [totalTrips, completedTrips, activeTrips] = await Promise.all([
			this.prisma.trip.count({
				where: { busId },
			}),
			this.prisma.trip.count({
				where: {
					busId,
					status: "completed",
				},
			}),
			this.prisma.trip.count({
				where: {
					busId,
					status: "active",
				},
			}),
		]);

		return {
			totalTrips,
			completedTrips,
			activeTrips,
		};
	}
}
