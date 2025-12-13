import { AppError } from "../errors/AppError";

export async function checkObjectInModelExistOrFail<T>(
	model: {
		findUnique: (args: any) => Promise<T | null>;
	},
	pk: string,
	value: string | number,
	errorMessage = "Record not found",
	select?: any
): Promise<T> {
	const record = await model.findUnique({
		where: { [pk]: value },
		select,
	});

	if (!record) {
		throw new AppError(errorMessage, 404);
	}

	return record;
}
