import { GraphQLResolveInfo } from "graphql";

export type ResolverFn<
	Parent = any,
	Args = any,
	Context = any,
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
	Context = any
> = ResolverFn<{}, Args, Context, Result>;

export type ResolversMap = {
	Query?: Record<string, ResolverFn>;
	Mutation?: Record<string, Record<string, ResolverFn> | ResolverFn>;
	[key: string]: any;
};
