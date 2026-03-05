import type { Request, Response } from "express";

import type { SalesService } from "~/application/services/salesService";
import { Controller } from "./controller";

export class SalesController extends Controller {
	constructor(private salesService: SalesService) {
		super();
	}

	getAllInvoices = async (_: Request, res: Response) => {
		try {
			const invoices = await this.salesService.getAllInvoices();
			res.status(200).json({ data: invoices });
		} catch (error: unknown) {
			this.handleError(res, error);
		}
	};
}
