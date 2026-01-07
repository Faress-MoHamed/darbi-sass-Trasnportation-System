import { PrismaClient, Driver, DriverStatus, Trip } from "@prisma/client";
import { AppError } from "../../errors/AppError";
import {
	createDriverSchema,
	CreateDriverInput,
} from "./validation/create-driver.validation";
import {
	updateDriverSchema,
	UpdateDriverInput,
} from "./validation/update-driver.validation";
import {
	DriverFiltersDto,
	PaginationDto,
	DriverListDto,
	TripHistoryFiltersDto,
} from "./dto/driver.dto";
import { UserService } from "../users/users.services";
import { PaginatedAndFilterService } from "../../services/Filters.service";
import type { PaginationArgs } from "../../helpers/pagination";
import { checkObjectInModelExistOrFail } from "../../helpers/checkObjectInModelExist";

// Driver Service
// Handles all business logic for driver management
export class DriverService {
	private prisma: PrismaClient;
	private userService: UserService;

	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new AppError("Prisma client instance is required", 500);
		}
		this.prisma = prisma;
		this.userService = new UserService();
	}

	// Validates that a license number is unique within a tenant
	private async validateLicenseUniqueness(
		licenseNumber: string,
		tenantId: string,
		excludeDriverId?: string
	): Promise<void> {
		const existing = await this.prisma.driver.findFirst({
			where: {
				licenseNumber,
				tenantId,
				...(excludeDriverId && { id: { not: excludeDriverId } }),
			},
		});

		if (existing) {
			throw new AppError(
				"License number is already registered for another driver",
				400
			);
		}
	}
	// Creates or updates a driver and related user
	async CuDriver(
		validatedData: CreateDriverInput | UpdateDriverInput,
		tenantId: string,
		driverId?: string
	) {
		// =============================
		// UPDATE DRIVER
		// =============================
		if (driverId) {
			const driver = await checkObjectInModelExistOrFail(
				this.prisma.driver,
				"id",
				driverId,
				"Driver not found"
			);

			// License uniqueness check
			if (validatedData.licenseNumber) {
				await this.validateLicenseUniqueness(
					validatedData.licenseNumber,
					driver.tenantId,
					driverId
				);
			}
			const result = await this.prisma.$transaction(async (tx) => {
				// Update only fields provided
				await tx.driver.update({
					where: { id: driverId },
					data: { ...validatedData },
				});
				await this.userService.updateUser(
					{
						id: driver.userId,
						name: validatedData.name,
						phone: validatedData.phone,
						email: validatedData.email,
					},
					tx.user
				);
			});
			return result;
		} else {
			// =============================
			// CREATE NEW DRIVER
			// =============================

			if (validatedData.licenseNumber) {
				await this.validateLicenseUniqueness(
					validatedData.licenseNumber,
					tenantId
				);
			}

			// Create user + driver in a single transaction
			const result = await this.prisma.$transaction(async (tx) => {
				// Create user
				let DriverUser;
				DriverUser = await this.userService.findByPhone(validatedData.phone);
				if (!DriverUser) {
					DriverUser = await this.userService.createUser(
						{
							phone: validatedData.phone,
							email: validatedData.email || null,
							name: validatedData.name,
							password: null,
							status: "active",
							phoneVerified: false,
							role: null,
						},
						tx.user
					);
				}
				// Create Driver
				const driver = await tx.driver.create({
					data: {
						userId: DriverUser.id,
						tenantId,
						licenseNumber: validatedData.licenseNumber,
						status: validatedData.status || DriverStatus.offline,
					},
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								phone: true,
								avatar: true,
							},
						},
					},
				});

				return driver;
			});
			return result;
		}
	}

	// Gets a driver by user ID
	async getDriverById(driverId: string): Promise<Driver | null> {
		await checkObjectInModelExistOrFail(
			this.prisma.driver,
			"id",
			driverId,
			"User not found"
		);
		return this.prisma.driver.findUnique({
			where: { id: driverId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
						avatar: true,
					},
				},
			},
		});
	}

	// // Lists drivers with optional filters and pagination
	async getAllDrivers(meta?: PaginationArgs) {
		return await new PaginatedAndFilterService(this.prisma.driver, [
			"licenseNumber",
			"status",
		]).filterAndPaginate(meta);
	}

	// Updates a driver
	async updateDriver(id: string, validatedData: UpdateDriverInput) {}

	// Updates driver status (online/offline/unavailable)
	async updateDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
		// Check if driver exists
		const driver = await this.prisma.driver.findUnique({
			where: { id },
		});

		if (!driver) {
			throw new AppError("Driver not found", 404);
		}

		// Update status
		const updatedDriver = await this.prisma.driver.update({
			where: { id },
			data: {
				status,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
						avatar: true,
					},
				},
			},
		});

		return updatedDriver;
	}

	async deleteDriver(id: string): Promise<boolean> {
		// Check if driver exists
		await checkObjectInModelExistOrFail(
			this.prisma.driver,
			"id",
			id,
			"Driver not found"
		);

		const activeTrips = await this.prisma.trip.count({
			where: {
				driverId: id,
				status: { in: ["in_progress", "boarding", "scheduled", "delayed"] },
			},
		});

		if (activeTrips > 0) {
			throw new AppError(
				"Cannot delete driver with active trips. Please complete or reassign trips first.",
				400
			);
		}
		await this.prisma.driver.delete({
			where: { id },
		});

		return true;
	}

	// Gets driver trip history
	async getDriverTripHistory(
		driverId: string,
		filters?: TripHistoryFiltersDto
	) {
		await checkObjectInModelExistOrFail(
			this.prisma.driver,
			"id",
			driverId,
			"Driver not found"
		);

		const trips = await new PaginatedAndFilterService(this.prisma.trip, [
			"status",
		]).filterAndPaginate({
			...filters?.meta,
			...(filters?.startDate && { departureTime: { gte: filters.startDate } }),
			...(filters?.endDate && { arrivalTime: { lte: filters.endDate } }),
			...(filters?.status && { status: filters.status }),
		});

		return trips;
	}
}
