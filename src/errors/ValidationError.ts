import { ZodError } from "zod";

export class ValidationError extends Error {
	public statusCode: number;
	public isOperational: boolean;
	public errors: ZodError["issues"]; // detailed errors array from Zod

	constructor(zodError: ZodError, statusCode = 400, isOperational = true) {
		super("Validation failed");
		console.log({
			errors: zodError.issues?.map((e) => e.path?.map((el) => el.toString())),
		});
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.errors = zodError.issues;

		// Include the stack trace
		Error.captureStackTrace(this, this.constructor);
	}
}
