import type { PrismaClient, Tenant } from "@prisma/client";
import { GraphQLResolveInfo } from "graphql";

export type ResolverFn<
	Parent = any,
	Args = any,
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
		prisma: PrismaClient;
		userId?: string;
	},
	Result = any
> = (
	parent: Parent,
	args: Args,
	context: Context,
	info: GraphQLResolveInfo
) => Promise<Result> | Result;

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
		};		prisma?: PrismaClient;
		userId?: string;
	}
> = ResolverFn<{}, Args, Context, Result>;

export type ResolversMap = {
	Query?: Record<string, ResolverFn>;
	Mutation?: Record<string, Record<string, ResolverFn> | ResolverFn>;
	[key: string]: any;
};
