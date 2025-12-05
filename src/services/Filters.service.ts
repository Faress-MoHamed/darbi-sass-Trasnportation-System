import {
	paginate,
	type PaginatedResult,
	type PaginationArgs,
} from "../helpers/pagination";

export class PaginatedAndFilterService<T> {
	private model: {
		findMany: Function;
		count: Function;
	};

	// Fields to be searched on, e.g. ['name', 'title']
	private searchFields: string[];

	constructor(
		model: { findMany: Function; count: Function },
		searchFields: string[] = []
	) {
		this.model = model;
		this.searchFields = searchFields;
	}

	async filterAndPaginate(args?: PaginationArgs): Promise<PaginatedResult<T>> {
		let where = args?.where ?? {};
		if (args?.search && this.searchFields.length > 0) {
			const searchConditions = this.searchFields.map((field) => ({
				[field]: { contains: args.search, mode: "insensitive" },
			}));
			where = {
				...where,
        OR: searchConditions,
        
			};
		}
		return paginate<T>(this.model, { ...args, where });
	}
}
