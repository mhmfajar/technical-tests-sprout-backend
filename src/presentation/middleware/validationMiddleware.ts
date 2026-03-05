import type { NextFunction, Request, Response } from "express";
import { ZodError, type z } from "zod";

export const validate = (schema: z.ZodSchema) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req.body);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.issues.map((issue) => ({
					message: issue.message,
					path: issue.path.join("."),
				}));
				res.status(422).json({
					errors: errorMessages,
					message: "Validation failed",
				});
			} else {
				next(error);
			}
		}
	};
};
