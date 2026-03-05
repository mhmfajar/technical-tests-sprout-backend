import type { Response } from "express";

import { AppError } from "~/domain/errors/AppError";

export class Controller {
	protected handleError(res: Response, error: unknown) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({
				message: error.message,
			});
		}

		if (error instanceof Error) {
			return res.status(500).json({
				message: error.message,
			});
		}

		return res.status(500).json({
			message: "An unexpected error occurred",
		});
	}
}
