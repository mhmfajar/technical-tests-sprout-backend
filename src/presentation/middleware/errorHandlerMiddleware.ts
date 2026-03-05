import type { NextFunction, Request, Response } from "express";

import { AppError } from "~/domain/errors/AppError";

export const errorHandlerMiddleware = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			message: err.message,
			status: "error",
		});
	}

	const error = err instanceof Error ? err : new Error("Something went wrong");
	console.error("UNEXPECTED ERROR:", error);

	const cause = (error as { cause?: unknown }).cause;
	if (cause) {
		console.error("CAUSE:", cause);
	}

	return res.status(500).json({
		message: error.message,
		status: "error",
	});
};
