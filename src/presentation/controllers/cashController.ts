import type { Request, Response } from "express";

import type { CashService } from "~/application/services/cashService";
import { Controller } from "./controller";

export class CashController extends Controller {
	constructor(private cashService: CashService) {
		super();
	}

	getReceipts = async (req: Request, res: Response) => {
		try {
			const q = typeof req.query.q === "string" ? req.query.q : undefined;
			const receipts = await this.cashService.getReceipts(q);
			res.status(200).json({ data: receipts });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	getDisbursements = async (req: Request, res: Response) => {
		try {
			const q = typeof req.query.q === "string" ? req.query.q : undefined;
			const disbursements = await this.cashService.getDisbursements(q);
			res.status(200).json({ data: disbursements });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	createReceipt = async (req: Request, res: Response) => {
		try {
			const { depositAccountId, receiptDate, memo, lines } = req.body;
			const receipt = await this.cashService.createReceipt({
				depositAccountId,
				lines,
				memo,
				receiptDate: new Date(receiptDate),
			});
			res.status(201).json({ data: receipt });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	createDisbursement = async (req: Request, res: Response) => {
		try {
			const {
				paidFromAccountId,
				payeeName,
				disbursementDate,
				memo,
				chequeNumber,
				isBlankCheque,
				lines,
			} = req.body;

			const disbursement = await this.cashService.createDisbursement({
				chequeNumber,
				disbursementDate: new Date(disbursementDate),
				isBlankCheque,
				lines,
				memo,
				paidFromAccountId,
				payeeName,
			});
			res.status(201).json({ data: disbursement });
		} catch (error) {
			this.handleError(res, error);
		}
	};
}
