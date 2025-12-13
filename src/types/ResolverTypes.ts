import type { PrismaClient, Tenant, User } from "@prisma/client";
import { GraphQLResolveInfo } from "graphql";
export type ResolverContext = {
	token?: string;
	tenant?: {
		id: string;
		token: string;
		refreshToken: string;
		userId: string;
		tenantId: string;
		createdAt: string;
		expiresAt: string;
		refreshExpiresAt: string;
	};
	prisma?: PrismaClient;
	userId?: string;
	user?: User | null;
	userRole?: {
		id: number;
		tenantId: string;
		deletedAt: Date | null;
		name: string;
		description: string | null;
	};
};
export type ResolverFn<
	Parent = any,
	Args = any,
	Context = ResolverContext,
	Result = any
> = (
	parent: Parent,
	args: Args,
	context: Context,
	info: GraphQLResolveInfo
) => Promise<Result> | Result;
export type TenantContext = ResolverContext & {
	tenant: NonNullable<ResolverContext["tenant"]>;
	tenantId: string;
};
export type QueryResolver<Args = any, Result = any, Context = any> = ResolverFn<
	{},
	Args,
	Context,
	Result
>;

export type MutationResolver<
	Args = any,
	Result = any,
	Context = {
		token?: string;
		tenant?: {
			id: string;
			token: string;
			refreshToken: string;
			userId: string;
			tenantId: string;
			createdAt: string;
			expiresAt: string;
			refreshExpiresAt: string;
		};
		prisma?: PrismaClient;
		userId?: string;
	}
> = ResolverFn<{}, Args, Context, Result>;

export type ResolverGroup = Record<string, ResolverFn>;
export type ResolverItem = ResolverFn | ResolverGroup;

export type ResolversMap = {
	[key: string]: Record<string, ResolverItem>;
};
