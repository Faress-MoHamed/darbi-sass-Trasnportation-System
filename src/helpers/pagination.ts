export interface PaginationArgs {
	page?: number;
	limit?: number;
	search?: any;
	where?: any;
	orderBy?: {
		field: string;
		direction: "asc" | "desc";
	};
	select?: {
		[k: string]: boolean;
	};
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface PaginatedResult<T> {
	data: T[];
	meta: PaginationMeta;
}

export async function paginate<T>(
	model: {
		findMany: Function;
		count: Function;
	},
	args?: PaginationArgs
): Promise<PaginatedResult<T>> {
	const page = args?.page ?? 1;
	const limit = args?.limit ?? 10;
	const skip = (page - 1) * limit;

	const where = args?.where ?? {};
	try {
		const [data, total] = await Promise.all([
			model.findMany({
				where,
				skip,
				take: limit,
				include: args?.select,
				orderBy: args?.orderBy ? { [args.orderBy.field]: args?.orderBy.direction || "asc" } : undefined,
			}),
			model.count({ where }),
		]);

		return {
			data: data || [],
			meta: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	} catch (error) {
		console.error("Pagination error:", error);
		throw error;
	}
}
