import type { Request, Response } from "express";

import type { AccountService } from "~/application/services/accountService";

export class AccountController {
	constructor(private accountService: AccountService) {}

	getAllAccounts = async (req: Request, res: Response) => {
		try {
			const q = typeof req.query.q === "string" ? req.query.q : undefined;
			const accounts = await this.accountService.getAllAccounts(q);
			res.status(200).json({ data: accounts });
		} catch (error: unknown) {
			const statusCode =
				error instanceof Error && "statusCode" in error
					? (error as { statusCode: number }).statusCode
					: 500;
			const message = error instanceof Error ? error.message : "Server error";
			res.status(statusCode).json({ message });
		}
	};

	getPostableAccounts = async (req: Request, res: Response) => {
		try {
			const q = typeof req.query.q === "string" ? req.query.q : undefined;
			const accounts = await this.accountService.getPostableAccounts(q);
			res.status(200).json(accounts);
		} catch (error: unknown) {
			const statusCode =
				error instanceof Error && "statusCode" in error
					? (error as { statusCode: number }).statusCode
					: 500;
			const message = error instanceof Error ? error.message : "Server error";
			res.status(statusCode).json({ message });
		}
	};

	createAccount = async (req: Request, res: Response) => {
		try {
			const { name, code, parent } = req.body;
			const account = await this.accountService.createAccount({
				code,
				name,
				parentId: parent,
			});
			res.status(201).json(account);
		} catch (error: unknown) {
			const statusCode =
				error instanceof Error && "statusCode" in error
					? (error as { statusCode: number }).statusCode
					: 400;
			const message = error instanceof Error ? error.message : "Bad request";
			res.status(statusCode).json({ message });
		}
	};

	updateAccount = async (req: Request, res: Response) => {
		try {
			const id = req.params.id as string;
			const { name, code, parent } = req.body;
			const account = await this.accountService.updateAccount(id, {
				code,
				name,
				parentId: parent,
			});
			res.status(200).json(account);
		} catch (error: unknown) {
			const statusCode =
				error instanceof Error && "statusCode" in error
					? (error as { statusCode: number }).statusCode
					: 400;
			const message = error instanceof Error ? error.message : "Bad request";
			res.status(statusCode).json({ message });
		}
	};

	deleteAccount = async (req: Request, res: Response) => {
		try {
			const id = req.params.id as string;
			await this.accountService.deleteAccount(id);
			res.status(204).send();
		} catch (error: unknown) {
			const statusCode =
				error instanceof Error && "statusCode" in error
					? (error as { statusCode: number }).statusCode
					: 400;
			const message = error instanceof Error ? error.message : "Bad request";
			res.status(statusCode).json({ message });
		}
	};
}
