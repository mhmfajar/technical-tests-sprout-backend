import type { Request, Response } from "express";

import type { UserService } from "~/application/services/userService";
import { UnauthorizedError } from "~/domain/errors/AppError";
import type { AuthRequest } from "~/presentation/middleware/authMiddleware";
import { Controller } from "./controller";

export class UserController extends Controller {
	constructor(private userService: UserService) {
		super();
	}

	register = async (req: Request, res: Response) => {
		try {
			const { name, username, password } = req.body;

			const user = await this.userService.registerUser(
				name,
				username,
				password,
			);

			res.status(201).json(user.withoutPassword());
		} catch (error) {
			this.handleError(res, error);
		}
	};

	login = async (req: Request, res: Response) => {
		try {
			const { username, password } = req.body;

			const { user, token } = await this.userService.login(username, password);

			res.status(200).json({
				token,
				user: user.withoutPassword(),
			});
		} catch (error) {
			this.handleError(res, error);
		}
	};

	getUser = async (req: Request, res: Response) => {
		try {
			const authReq = req as AuthRequest;
			const userId = authReq.user?.userId;

			if (!userId) {
				throw new UnauthorizedError("User session not found");
			}

			const user = await this.userService.getUser(userId);
			res.status(200).json(user.withoutPassword());
		} catch (error) {
			this.handleError(res, error);
		}
	};
}
