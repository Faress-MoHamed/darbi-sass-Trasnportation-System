import {
	paginate,
	type PaginatedResult,
	type PaginationArgs,
} from "../helpers/pagination";

type FilterItem = {
	filterField: string;
	filterValue: any;
};

export class PaginatedAndFilterService<T> {
	private model: {
		findMany: Function;
		count: Function;
	};

	private searchFields: string[];

	constructor(
		model: { findMany: Function; count: Function },
		searchFields: string[] = []
	) {
		this.model = model;
		this.searchFields = searchFields;
	}

	async filterAndPaginate(
		args?: PaginationArgs,
		filters?: FilterItem[],
		selectFields?: string[]
	): Promise<PaginatedResult<T>> {
		let where: any = args?.where ?? {};

		/* ✅ apply filters */
		if (filters?.length) {
			const filtersWhere = filters.reduce((acc, filter) => {
				acc[filter.filterField] = filter.filterValue;
				return acc;
			}, {} as Record<string, any>);

			where = {
				...where,
				...filtersWhere,
			};
		}

		/* ✅ apply search */
		if (args?.search && this.searchFields.length > 0) {
			const searchConditions = this.searchFields.map((field) => ({
				[field]: {
					contains: args.search,
					mode: "insensitive",
				},
			}));

			where = {
				...where,
				OR: searchConditions,
			};
		}

		return paginate<T>(this.model, { ...args, where, select: selectFields ? Object.fromEntries(selectFields.map(field => [field, true])) : undefined });
	}
}
