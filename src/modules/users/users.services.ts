import {
	PrismaClient,
	TenantStatus,
	UserRoleEnum,
	type User,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { AuthErrorService } from "../auth/authError.service";
import { createUserSchema } from "./validations/create-user.validation";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { updateUserSchema } from "./validations/updateUser.validation";
import { checkObjectInModelExistOrFail } from "../../helpers/checkObjectInModelExist";

export class UserService {
	private readonly SALT_ROUNDS = 12;
	private prisma = prisma;
	private User = this.prisma.user;
	private Tenant = this.prisma.tenant;
	private Passenger = this.prisma.passenger;
	async hashPassword(password: string) {
		return bcrypt.hash(password, this.SALT_ROUNDS);
	}

	async verifyPassword(password: string, hash: string) {
		return bcrypt.compare(password, hash);
	}

	async findByPhone(phone: string) {
		return this.User.findFirst({ where: { phone } });
	}
	async findByToken(token?: string) {
		return this.User.findFirst({
			where: { accessTokens: { some: { token } } },
		});
	}

	async findByPhoneWithTenant(phone: string) {
		await checkObjectInModelExistOrFail(
			this.User,
			"phone",
			phone,
			"User not found"
		);
		return this.User.findFirst({
			where: { phone },
			include: {
				passenger: true,
				driver: true,
			},
		});
	}
	async getUserById(userId: string) {
		await checkObjectInModelExistOrFail(
			this.User,
			"id",
			userId,
			"User not found"
		);
		return this.User.findFirst({
			where: { id: userId },
			include: {
				passenger: true,
				driver: true,
			},
		});
	}

	async createUser(
		data: Omit<
			User,
			| "id"
			| "createdAt"
			| "updated_at"
			| "avatar"
			| "language"
			| "mustChangePassword"
			| "lastLogin"
			| "password"
			| "deletedAt"
		> & {
			password: string | null;
			tenantId?: string;
			mustChangePassword?: boolean;
		},
		Model?: PrismaClient["user"],
		tenantId?: string
	) {
		const PrismaModel = Model ? Model : this.User;

		const { data: CleanedPayload, error } = createUserSchema.safeParse(data);
		if (error) {
			throw new AppError(error.message, 400);
		}
		const existingUser = await PrismaModel.findFirst({
			where: {
				OR: [
					{ phone: CleanedPayload.phone },
					...(CleanedPayload.email ? [{ email: CleanedPayload.email }] : []),
				],
			},
		});

		if (existingUser) {
			throw new Error("User with this phone or email already exists");
		}

		const passwordHash = CleanedPayload.password
			? await this.hashPassword(CleanedPayload.password)
			: null;
		let User: User;

		if (!CleanedPayload.role) {
			return (User = await this.prisma.$transaction(async (tx) => {
				const TXuser = await tx.user.create({
					data: {
						phone: CleanedPayload.phone,
						email: CleanedPayload.email,
						name: CleanedPayload.name,
						password: passwordHash,
						status: TenantStatus.active,
						mustChangePassword: true,
					},
				});
				await tx.passenger.create({
					data: {
						tenantId,
						userId: TXuser.id,
					},
				});

				return TXuser;
			}));
		} else {
			return (User = await PrismaModel.create({
				data: {
					phone: CleanedPayload.phone,
					email: CleanedPayload.email,
					name: CleanedPayload.name,
					password: passwordHash,
					role: CleanedPayload.role,
					status: TenantStatus.active,
					mustChangePassword: true,
				},
			}));
		}
	}

	async updateLastLogin(userId: string) {
		await this.User.update({
			where: { id: userId },
			data: { lastLogin: new Date() },
		});
	}
	async updateUser(
		data: Partial<Omit<User, "createdAt" | "updated_at">> & { id: string },
		Model?: any
	) {
		const PrismaModel = Model ? Model : this.User;

		// Validate input (id required)
		const { data: validatedData, error } = updateUserSchema.safeParse(data);
		if (error) throw new AppError(error.message, 400);

		const { id, password, phone, email, ...updateFields } = validatedData;

		// Check user exists
		const user = await PrismaModel.findUnique({ where: { id } });
		if (!user) throw new AppError("User not found", 404);

		// If phone or email is changing, check uniqueness
		if (phone && phone !== user.phone) {
			const phoneExists = await PrismaModel.findFirst({ where: { phone } });
			if (phoneExists) throw new AppError("Phone already in use", 400);
		}
		if (email && email !== user.email) {
			const emailExists = await PrismaModel.findFirst({ where: { email } });
			if (emailExists) throw new AppError("Email already in use", 400);
		}

		// If password present, hash it
		let passwordHash;
		if (password) {
			passwordHash = await this.hashPassword(password);
		}

		const updatedUser = await PrismaModel.update({
			where: { id },
			data: {
				...updateFields,
				phone,
				email,
				...(passwordHash
					? { password: passwordHash, mustChangePassword: false }
					: {}),
			},
		});

		return updatedUser;
	}
	async updatePassword(userId: string, newPassword: string) {
		const passwordHash = await this.hashPassword(newPassword);
		console.log({ passwordHash, userId });
		await this.User.update({
			where: { id: userId },
			data: { password: passwordHash, mustChangePassword: false },
		});
	}
}
