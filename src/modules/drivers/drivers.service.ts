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

// Driver Service
// Handles all business logic for driver management
export class DriverService {
	constructor(private prisma: PrismaClient) {}

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

    // Creates a new driver along with a user account
    async createDriver(data: CreateDriverInput, contextTenantId?: string): Promise<Driver> {
        // Validate input
        const { data: validatedData, error } = createDriverSchema.safeParse(data);
        if (error) {
            throw new AppError(error.message, 400);
        }

        // Ensure we have tenantId from context
        if (!contextTenantId) {
            throw new AppError(
                "Authentication required. Please login to create a driver.",
                401
            );
        }

        // Validate license uniqueness
        await this.validateLicenseUniqueness(
            validatedData.licenseNumber,
            contextTenantId
        );

		// Check if user with this phone already exists
		const existingUser = await this.prisma.user.findFirst({
			where: {
				OR: [
					{ phone: validatedData.phone },
					...(validatedData.email ? [{ email: validatedData.email }] : []),
				],
			},
		});

		if (existingUser) {
			throw new AppError("User with this phone or email already exists", 400);
		}

        // Validate tenant exists and is active
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: contextTenantId },
        });

		if (!tenant) {
			throw new AppError("Tenant not found", 404);
		}

		if (tenant.status !== "active") {
			throw new AppError("Tenant is not active", 403);
		}

		// Hash password
		const bcrypt = require("bcrypt");
		const SALT_ROUNDS = 12;
		const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

        // Create user and driver in a transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Create user with driver role
            const user = await tx.user.create({
                data: {
                    tenantId: contextTenantId,
                    phone: validatedData.phone,
                    email: validatedData.email ?? null,
                    name: validatedData.name,
                    password: passwordHash,
                    role: "driver",
                    status: "active",
                    mustChangePassword: true,
                },
            });

            // Create driver linked to the new user
            const driver = await tx.driver.create({
                data: {
                    userId: user.id,
                    tenantId: contextTenantId,
                    licenseNumber: validatedData.licenseNumber,
                    vehicleType: validatedData.vehicleType,
                    status: validatedData.status || DriverStatus.offline,
                    connected: validatedData.status === DriverStatus.available,
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

	// Gets a driver by ID
	async getDriverById(id: string): Promise<Driver | null> {
		return this.prisma.driver.findUnique({
			where: { id },
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

	// Gets a driver by user ID
	async getDriverByUserId(userId: string): Promise<Driver | null> {
		return this.prisma.driver.findUnique({
			where: { userId },
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

	// Lists drivers with optional filters and pagination
	async listDrivers(
		filters?: DriverFiltersDto,
		pagination?: PaginationDto
	): Promise<DriverListDto<Driver>> {
		const page = pagination?.page || 1;
		const limit = pagination?.limit || 10;
		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		// Tenant filtering - CRITICAL for multi-tenant security
		if (filters?.tenantId) {
			where.tenantId = filters.tenantId;
		}

		if (filters?.status) {
			where.status = filters.status;
		}

		if (filters?.vehicleType) {
			where.vehicleType = filters.vehicleType;
		}

		if (filters?.minRating) {
			where.rating = { gte: filters.minRating };
		}

		if (filters?.search) {
			where.OR = [
				{ licenseNumber: { contains: filters.search, mode: "insensitive" } },
				{ user: { name: { contains: filters.search, mode: "insensitive" } } },
				{ user: { phone: { contains: filters.search, mode: "insensitive" } } },
			];
		}

		// Execute queries in parallel
		const [drivers, totalCount] = await Promise.all([
			this.prisma.driver.findMany({
				where,
				skip,
				take: limit,
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
				orderBy: { user: { createdAt: "desc" } },
			}),
			this.prisma.driver.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		return {
			nodes: drivers,
			totalCount,
			pageInfo: {
				currentPage: page,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		};
	}

	// Updates a driver
	async updateDriver(id: string, data: UpdateDriverInput): Promise<Driver> {
		// Validate input
		const { data: validatedData, error } = updateDriverSchema.safeParse(data);
		if (error) {
			throw new AppError(error.message, 400);
		}

		// Check if driver exists
		const driver = await this.prisma.driver.findUnique({
			where: { id },
		});

		if (!driver) {
			throw new AppError("Driver not found", 404);
		}

		// Validate license uniqueness if being updated
		if (validatedData.licenseNumber) {
			await this.validateLicenseUniqueness(
				validatedData.licenseNumber,
				driver.tenantId,
				id
			);
		}

		// Update driver
		const updatedDriver = await this.prisma.driver.update({
			where: { id },
			data: {
				...(validatedData.licenseNumber && {
					licenseNumber: validatedData.licenseNumber,
				}),
				...(validatedData.vehicleType && {
					vehicleType: validatedData.vehicleType,
				}),
				...(validatedData.status && {
					status: validatedData.status,
					connected: validatedData.status === DriverStatus.available,
				}),
				...(validatedData.rating !== undefined && {
					rating: validatedData.rating,
				}),
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
				connected: status === DriverStatus.available,
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

	// Deletes a driver
	async deleteDriver(id: string): Promise<boolean> {
		// Check if driver exists
		const driver = await this.prisma.driver.findUnique({
			where: { id },
		});

		if (!driver) {
			throw new AppError("Driver not found", 404);
		}

		// Check if driver has active trips
		const activeTrips = await this.prisma.trip.count({
			where: {
				driverId: id,
				status: "active",
			},
		});

		if (activeTrips > 0) {
			throw new AppError(
				"Cannot delete driver with active trips. Please complete or reassign trips first.",
				400
			);
		}

		// Delete driver
		await this.prisma.driver.delete({
			where: { id },
		});

		return true;
	}

	// Gets driver trip history
	async getDriverTripHistory(
		driverId: string,
		filters?: TripHistoryFiltersDto
	): Promise<Trip[]> {
		// Check if driver exists
		const driver = await this.prisma.driver.findUnique({
			where: { id: driverId },
		});

		if (!driver) {
			throw new AppError("Driver not found", 404);
		}

		// Build where clause
		const where: any = { driverId };

		if (filters?.startDate) {
			where.departureTime = { gte: filters.startDate };
		}

		if (filters?.endDate) {
			where.arrivalTime = { lte: filters.endDate };
		}

		if (filters?.status) {
			where.status = filters.status;
		}

		// Get trips
		const trips = await this.prisma.trip.findMany({
			where,
			include: {
				route: true,
				bus: true,
				tripStations: {
					include: {
						station: true,
					},
				},
				tripPerformance: true,
			},
			orderBy: { departureTime: "desc" },
		});

		return trips;
	}

	// Gets driver statistics
	async getDriverStatistics(driverId: string) {
		// Check if driver exists
		const driver = await this.prisma.driver.findUnique({
			where: { id: driverId },
		});

		if (!driver) {
			throw new AppError("Driver not found", 404);
		}

		// Get statistics
		const [totalTrips, completedTrips, cancelledTrips, activeTrips] =
			await Promise.all([
				this.prisma.trip.count({ where: { driverId } }),
				this.prisma.trip.count({
					where: { driverId, status: "completed" },
				}),
				this.prisma.trip.count({
					where: { driverId, status: "cancelled" },
				}),
				this.prisma.trip.count({ where: { driverId, status: "active" } }),
			]);

		return {
			totalTrips,
			completedTrips,
			cancelledTrips,
			activeTrips,
			rating: driver.rating,
		};
	}
}
