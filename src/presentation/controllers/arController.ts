import type { Request, Response } from "express";

import type { ArService } from "~/application/services/arService";
import { Controller } from "./controller";

export class ArController extends Controller {
	constructor(private arService: ArService) {
		super();
	}

	getDashboardSummary = async (_req: Request, res: Response) => {
		try {
			const summary = await this.arService.getDashboardSummary();
			res.status(200).json({ data: summary });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	getPayableInvoices = async (req: Request, res: Response) => {
		try {
			const { customerId } = req.params;
			const invoices = await this.arService.getPayableInvoices(
				customerId as string,
			);
			res.status(200).json({ data: invoices });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	getAllUnpaidInvoices = async (_req: Request, res: Response) => {
		try {
			const invoices = await this.arService.getAllUnpaidInvoices();
			res.status(200).json({ data: invoices });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	recordPayment = async (req: Request, res: Response) => {
		try {
			const {
				customerId,
				depositAccountId,
				discountAccountId,
				paymentDate,
				discountPercent,
				totalReceived,
				allocations,
			} = req.body;
			const payment = await this.arService.recordPayment({
				allocations,
				customerId,
				depositAccountId,
				discountAccountId,
				discountPercent,
				paymentDate: new Date(paymentDate),
				totalReceived,
			});
			res.status(201).json({ data: payment });
		} catch (error) {
			this.handleError(res, error);
		}
	};
}
