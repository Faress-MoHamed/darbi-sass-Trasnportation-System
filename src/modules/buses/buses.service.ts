import { Bus, BusStatus, type PrismaClient } from "@prisma/client";
import { AppError } from "../../errors/AppError";

import type { PaginationArgs } from "../../helpers/pagination";
import { BusRepository } from "./buses.repository";
import type { CreateBusInput, UpdateBusInput } from "./dto/bus.dto";

// Bus Service
// Handles all business logic for bus management
export class BusService {
	private busRepository: BusRepository;
	private prisma?: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("Prisma client instance is required", 500);
		}
		this.busRepository = new BusRepository(prisma);
	}

	// ============================================================================
	// Validation Helpers
	// ============================================================================

	/**
	 * Validates that a bus number is unique within a tenant
	 */
	private async validateBusNumberUniqueness(
		busNumber: string,
		excludeBusId?: string
	) {
		const existingBus = excludeBusId
			? await this.busRepository.findByBusNumberExcludingId(
					busNumber,
					excludeBusId
			  )
			: await this.busRepository.findByBusNumber(busNumber);

		if (existingBus) {
			throw new AppError(
				`Bus number '${busNumber}' already exists in this tenant`,
				400
			);
		}
	}

	/**
	 * Validates that a bus exists and belongs to the tenant
	 */
	private async validateBusExists(busId: string) {
		const bus = await this.busRepository.findById(busId);

		if (!bus) {
			throw new AppError("Bus not found", 404);
		}

		return bus;
	}

	// ============================================================================
	// CRUD Operations
	// ============================================================================

	/**
	 * Creates a new bus
	 */
	async createBus(data: CreateBusInput, contextTenantId: string) {
		// Check bus number uniqueness within tenant
		await this.validateBusNumberUniqueness(data.busNumber);

		// Create bus
		const bus = await this.busRepository.create({
			tenant: {
				connect: { id: contextTenantId },
			},
			busNumber: data.busNumber,
			capacity: data.capacity,
			type: data.type,
			status: data.status || "stopped",
			gpsTrackerId: data.gpsTrackerId,
			maintenanceStatus: data.maintenanceStatus,
		});

		return bus;
	}

	/**
	 * Gets a bus by ID
	 */
	async getBusById(id: string) {
		return await this.busRepository.findById(id);
	}

	/**
	 * Gets a bus by bus number within a tenant
	 */
	async getBusByNumber(busNumber: string) {
		return await this.busRepository.findByBusNumber(busNumber);
	}

	/**
	 * Lists buses with optional filters and pagination
	 */
	async listBuses(meta?: PaginationArgs) {
		return await this.busRepository.findAll(meta);
	}

	/**
	 * Gets all buses for a tenant with optional status filter
	 */
	async getBusesByTenant(status?: BusStatus) {
		return await this.busRepository.findByStatus(status);
	}

	/**
	 * Updates a bus
	 */
	async updateBus(id: string, data: UpdateBusInput["data"]) {
		// Check if bus exists
		const existingBus = await this.validateBusExists(id);

		// If bus number is being updated, check uniqueness
		if (data.busNumber && data.busNumber !== existingBus.busNumber) {
			await this.validateBusNumberUniqueness(data.busNumber, existingBus.id);
		}

		// Update bus
		return await this.busRepository.update(id, data);
	}

	/**
	 * Soft deletes a bus
	 */
	async deleteBus(id: string) {
		// Check if bus exists with active trips
		const existingBus = await this.busRepository.findByIdWithTrips(id);

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

		// Soft delete bus
		await this.busRepository.softDelete(id);

		return true;
	}

	/**
	 * Hard deletes a bus (admin only)
	 */
	async hardDeleteBus(id: string) {
		// Check if bus exists
		const existingBus = await this.busRepository.findDeleted(id);

		if (!existingBus) {
			throw new AppError("Bus not found", 404);
		}

		// Hard delete bus
		await this.busRepository.hardDelete(id);

		return true;
	}

	/**
	 * Restores a soft-deleted bus
	 */
	async restoreBus(id: string) {
		const bus = await this.busRepository.findDeleted(id);

		if (!bus) {
			throw new AppError("Bus not found", 404);
		}

		if (!bus.deletedAt) {
			throw new AppError("Bus is not deleted", 400);
		}

		return await this.busRepository.restore(id);
	}

	// ============================================================================
	// Status Management
	// ============================================================================

	/**
	 * Updates bus status (active/maintenance/stopped)
	 */
	async updateBusStatus(
		id: string,
		status: BusStatus,
		maintenanceStatus?: string
	) {
		// Check if bus exists
		await this.validateBusExists(id);

		// Update status
		const updatedBus = await this.busRepository.update(id, {
			status,
			...(maintenanceStatus !== undefined && { maintenanceStatus }),
		});

		// Log status change
		await this.busRepository.createStatusLog(id, status);

		return updatedBus;
	}

	/**
	 * Activates a bus (sets status to active)
	 */
	async activateBus(id: string) {
		return await this.updateBusStatus(id, "active", undefined);
	}

	/**
	 * Deactivates a bus (sets status to stopped)
	 */
	async deactivateBus(id: string) {
		return await this.updateBusStatus(id, "stopped", undefined);
	}

	/**
	 * Sets bus to maintenance mode
	 */
	async setMaintenance(id: string, maintenanceStatus: string) {
		return await this.updateBusStatus(id, "maintenance", maintenanceStatus);
	}

	// ============================================================================
	// GPS & Tracking
	// ============================================================================

	/**
	 * Gets the latest GPS location of a bus
	 */
	async getLatestBusLocation(busId: string) {
		await this.validateBusExists(busId);
		return await this.busRepository.findLatestGpsData(busId);
	}

	/**
	 * Gets GPS history for a bus
	 */
	async getBusGpsHistory(busId: string, startDate?: Date, endDate?: Date) {
		await this.validateBusExists(busId);
		return await this.busRepository.findGpsHistory(busId, startDate, endDate);
	}

	/**
	 * Updates bus GPS tracker ID
	 */
	async updateGpsTracker(busId: string, gpsTrackerId: string) {
		await this.validateBusExists(busId);
		return await this.busRepository.update(busId, { gpsTrackerId });
	}

	// ============================================================================
	// Trip Management
	// ============================================================================

	/**
	 * Gets active trips for a bus
	 */
	async getActiveTripsByBus(busId: string) {
		await this.validateBusExists(busId);
		return await this.busRepository.findActiveTrips(busId);
	}

	/**
	 * Gets trip history for a bus
	 */
	async getTripHistoryByBus(busId: string, limit: number = 50) {
		await this.validateBusExists(busId);
		return await this.busRepository.findTripHistory(busId, limit);
	}

	// ============================================================================
	// Availability & Scheduling
	// ============================================================================

	/**
	 * Checks if a bus is available for a specific time slot
	 */
	async isBusAvailable(busId: string, startTime: Date, endTime: Date) {
		const bus = await this.validateBusExists(busId);

		// Bus must be active
		if (bus.status !== "active") {
			return false;
		}

		// Check for conflicting trips
		const conflictingTripsCount =
			await this.busRepository.countConflictingTrips(busId, startTime, endTime);

		return conflictingTripsCount === 0;
	}

	/**
	 * Gets available buses for a time slot
	 */
	async getAvailableBuses(startTime: Date, endTime: Date) {
		// Get all active buses
		const activeBuses = await this.busRepository.findActiveBuses();

		// Filter buses that don't have conflicting trips
		const availableBuses = [];
		for (const bus of activeBuses) {
			const isAvailable = await this.isBusAvailable(bus.id, startTime, endTime);
			if (isAvailable) {
				availableBuses.push(bus);
			}
		}

		return availableBuses;
	}

	// ============================================================================
	// Maintenance Management
	// ============================================================================

	/**
	 * Gets buses due for maintenance
	 */
	async getBusesDueForMaintenance(thresholdKm?: number) {
		// This is a placeholder - you might want to add maintenance tracking fields
		return await this.busRepository.findMaintenanceBuses();
	}

	/**
	 * Schedules maintenance for a bus
	 */
	async scheduleMaintenance(busId: string, maintenanceNotes: string) {
		await this.validateBusExists(busId);
		return await this.updateBusStatus(busId, "maintenance", maintenanceNotes);
	}

	/**
	 * Completes maintenance for a bus
	 */
	async completeMaintenance(busId: string) {
		const bus = await this.validateBusExists(busId);

		if (bus.status !== "maintenance") {
			throw new AppError("Bus is not in maintenance mode", 400);
		}

		return await this.updateBusStatus(busId, "active", "Maintenance completed");
	}

	// ============================================================================
	// Bulk Operations
	// ============================================================================

	/**
	 * Bulk updates bus status
	 */
	async bulkUpdateStatus(busIds: string[], status: BusStatus) {
		return await this.busRepository.bulkUpdateStatus(busIds, status);
	}

	/**
	 * Bulk deletes buses
	 */
	async bulkDelete(busIds: string[]) {
		// Check for active trips
		const busesWithActiveTrips =
			await this.busRepository.findBusesWithActiveTrips(busIds);

		const busesWithTrips = busesWithActiveTrips.filter(
			(bus) => bus.trips.length > 0
		);

		if (busesWithTrips.length > 0) {
			throw new AppError(
				`Cannot delete buses with active trips: ${busesWithTrips
					.map((b) => b.busNumber)
					.join(", ")}`,
				400
			);
		}

		return await this.busRepository.bulkSoftDelete(busIds);
	}
}
