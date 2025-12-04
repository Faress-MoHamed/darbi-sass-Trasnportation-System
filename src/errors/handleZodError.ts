import { ZodError } from "zod";
import { AppError } from "./AppError";

export function handleZodError(error: any) {
	const message = error.errors.map((e: any) => e.message).join(", ");
	return new AppError(message, 400);
}
