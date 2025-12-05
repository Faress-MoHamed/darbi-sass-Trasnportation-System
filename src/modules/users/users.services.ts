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
		return this.User.findFirst({ where: { accessTokens: { some: { token } } } });
	}

	async findByPhoneWithTenant(phone: string) {
		return this.User.findFirst({
			where: { phone },
			include: { tenant: true },
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
		>,
		Model?: any,
		TenantModel?: any
	) {
		const PrismaModel = Model ? Model : this.User;
		const TenantPrismaModel = TenantModel ? TenantModel : this.Tenant;

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

		const tenant = await TenantPrismaModel.findUnique({
			where: { id: CleanedPayload.tenantId },
		});

		if (!tenant) AuthErrorService.throwTenantNotFound();
		if (
			tenant.status !== TenantStatus.active &&
			CleanedPayload.role !== "admin"
		)
			AuthErrorService.throwTenantNotActive();

		const passwordHash = await this.hashPassword(CleanedPayload.password);

		const user = await PrismaModel.create({
			data: {
				tenantId: CleanedPayload.tenantId,
				phone: CleanedPayload.phone,
				email: CleanedPayload.email,
				name: CleanedPayload.name,
				password: passwordHash,
				role: CleanedPayload.role || UserRoleEnum.passenger,
				status: TenantStatus.active,
				mustChangePassword: true,
			},
		});

		if (user.role === UserRoleEnum.passenger) {
			await this.Passenger.create({
				data: {
					tenantId: CleanedPayload.tenantId,
					userId: user.id,
					pointsBalance: 0,
				},
			});
		}

		return user;
	}

	async updateLastLogin(userId: string) {
		await this.User.update({
			where: { id: userId },
			data: { lastLogin: new Date() },
		});
	}

	async updatePassword(userId: string, newPassword: string) {
		const passwordHash = await this.hashPassword(newPassword);
		await this.User.update({
			where: { id: userId },
			data: { password: passwordHash, mustChangePassword: false },
		});
	}
}
