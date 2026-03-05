import type { Request, Response } from "express";

import type { JournalService } from "~/application/services/journalService";
import { Controller } from "./controller";

export class JournalController extends Controller {
	constructor(private journalService: JournalService) {
		super();
	}

	getJournals = async (req: Request, res: Response) => {
		try {
			const q = typeof req.query.q === "string" ? req.query.q : undefined;
			const journals = await this.journalService.getJournals(q);
			res.status(200).json({ data: journals });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	getJournalById = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const journal = await this.journalService.getJournalById(id as string);
			res.status(200).json({ data: journal });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	createJournal = async (req: Request, res: Response) => {
		try {
			const { journalDate, description, status, lines, salesInvoiceId } =
				req.body;
			const parsedDate = new Date(journalDate);
			const journal = await this.journalService.createJournal({
				description,
				journalDate: parsedDate,
				lines,
				salesInvoiceId,
				status,
			});
			res.status(201).json({ data: journal });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	updateJournal = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const { journalDate, description, status, lines, salesInvoiceId } =
				req.body;
			const parsedDate = new Date(journalDate);
			const journal = await this.journalService.updateJournal(id as string, {
				description,
				journalDate: parsedDate,
				lines,
				salesInvoiceId,
				status,
			});
			res.status(200).json({ data: journal });
		} catch (error) {
			this.handleError(res, error);
		}
	};

	reverseJournal = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const { reason } = req.body;
			const journal = await this.journalService.reverseJournal(
				id as string,
				reason,
			);
			res.status(200).json({ data: journal });
		} catch (error) {
			this.handleError(res, error);
		}
	};
}
