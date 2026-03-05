import type { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "~/domain/errors/AppError";
import { verifyToken } from "~/infrastructure/utils/token";

export interface AuthRequest extends Request {
	user?: {
		userId: string;
		username: string;
		name: string;
	};
}

export const authMiddleware = (
	req: AuthRequest,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader?.startsWith("Bearer ")) {
			throw new UnauthorizedError("Authorization token required");
		}

		const token = authHeader.split(" ")[1];
		const decoded = verifyToken(token);

		req.user = decoded;
		next();
	} catch (_) {
		next(new UnauthorizedError("Invalid or expired token"));
	}
};
