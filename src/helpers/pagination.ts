export interface PaginationArgs {
	page?: number;
	limit?: number;
	search?: string;
	where?: any;
	orderBy?: any;
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
	const orderBy = args?.orderBy ?? { createdAt: "desc" };

	const [data, total] = await Promise.all([
		model.findMany({
			where,
			skip,
			take: limit,
			orderBy,
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
}
