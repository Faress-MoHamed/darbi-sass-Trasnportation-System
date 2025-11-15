import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("🔥 Express Error:", err);
  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
      error: err,
    }),
  });
}
