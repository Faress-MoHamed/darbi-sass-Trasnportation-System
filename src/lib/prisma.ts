import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../errors/AppError";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const connectionString = `postgres://avnadmin:AVNS_-wSBsbg-x5KZud7HU9M@pg-320ef1ad-fareess-466d.k.aivencloud.com:22508/defaultdb?sslmode=verify-full&sslrootcert=certs/ca.pem`;
const adapter = new PrismaPg({ connectionString });
const modelsWithoutDirectTenantId = [
	"Permission",
	"RolePermission",
	"OtpToken",
	"TripStation",
	"TripLog",
	"TripPerformance",
	"GpsData",
	"BusStatusLog",
	"AuditLog",
	"SupportReply",
	"UserCustomFieldValue",
	"DriverCustomFieldValue",
	"BusCustomFieldValue",
	"PassengerCustomFieldValue",
	"TripCustomFieldValue",
	"BookingCustomFieldValue",
	"RouteCustomFieldValue",
	"Bus",
];
export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ["error", "warn"],
		adapter,
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
const addToActivityLog = async (
	userId: string | null,
	logType: "action" | "audit" | "security" | "system",
	action: string,
	entityType?: string
) => {
	await prisma.activityLog.create({
		data: {
			userId: userId || undefined,
			logType,
			action,
			entityType,
		},
	});
};
export const PrismaForDev = (tenantId?: string, userId?: string) => {
	return prisma.$extends({
		query: {
			$allModels: {
				async findMany({ model, args, query }) {
					if (!tenantId) throw new AppError("tenantId is required", 400);

					args.where = {
						...(args.where as any),
						...(tenantId ? { tenantId } : {}),
						deletedAt: null, // Soft delete filter
					};
					return query(args);
				},

				async findFirst({ model, args, query }) {

					args.where = {
						...(args.where as any),
						...(tenantId ? { tenantId } : {}),
						deletedAt: null, // Soft delete filter
					};
					return query(args);
				},

				async create({ model, args, query }) {
					if (!tenantId) throw new AppError("tenantId is required", 400);
					if (!modelsWithoutDirectTenantId.includes(model)) {
						args.data = {
							...(args.data as any),
							...(tenantId ? { tenantId } : {}),
						};
					}
					await addToActivityLog(
						userId || null,
						"action",
						`Created a new record in ${model} model`
					);
					return query(args);
				},

				async update({ model, args, query }) {
					if (!tenantId) throw new AppError("tenantId is required", 400);

					if (!modelsWithoutDirectTenantId.includes(model)) {
						args.where = {
							...(args.where as any),
							...(tenantId ? { tenantId } : {}),
						};
					}
					await addToActivityLog(
						userId || null,
						"action",
						`updated a record in ${model} model`
					);
					return query(args);
				},
				async delete({ model, args, query, operation }) {
					console.log({ tenantId });
					if (!tenantId) throw new AppError("tenantId is required", 400);

					if (!modelsWithoutDirectTenantId.includes(model)) {
						args.where = {
							...(args.where as any),
							...(tenantId ? { tenantId } : {}),
						};
					}
					await addToActivityLog(
						userId || null,
						"action",
						`deleted a record in ${model} model`
					);
					return (prisma[model as keyof typeof prisma] as any).update({
						where: args.where,
						data: { deletedAt: new Date() },
					});
				},
			},
		},
	});
};
