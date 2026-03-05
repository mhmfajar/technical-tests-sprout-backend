import type { IJournalRepository } from "~/application/repositories/journalRepository";
import { BadRequestError, NotFoundError } from "~/domain/errors/AppError";
import type { NewJournal, NewJournalLine } from "~/domain/journal";

export class JournalService {
	constructor(private journalRepo: IJournalRepository) {}

	async getJournals(q?: string) {
		return this.journalRepo.findAll(q);
	}

	async getJournalById(id: string) {
		const journal = await this.journalRepo.findById(id);
		if (!journal) {
			throw new NotFoundError("Journal not found");
		}
		return journal;
	}

	async createJournal(data: {
		journalDate: Date;
		description: string;
		status?: "DRAFT" | "POSTED";
		salesInvoiceId?: string;
		lines: {
			accountId: string;
			debit: number;
			credit: number;
			memo?: string;
		}[];
	}) {
		if (data.lines.length < 2) {
			throw new BadRequestError("Journal must have at least two lines");
		}

		const totalDebit = data.lines.reduce(
			(sum, line) => sum + Number(line.debit),
			0,
		);
		const totalCredit = data.lines.reduce(
			(sum, line) => sum + Number(line.credit),
			0,
		);

		if (totalDebit !== totalCredit) {
			throw new BadRequestError("Total debit must equal total credit");
		}
		if (totalDebit <= 0) {
			throw new BadRequestError("Total amount must be positive");
		}

		const year = new Date().getFullYear();
		const prefix = `JU-${year}`;
		const journalNumber = await this.journalRepo.findNextJournalNumber(prefix);

		const journal: NewJournal = {
			description: data.description,
			journalDate: data.journalDate,
			journalNumber,
			postedAt: data.status === "POSTED" ? new Date() : null,
			reversalReason: null,
			reversedFromId: null,
			salesInvoiceId:
				data.salesInvoiceId === "" || !data.salesInvoiceId
					? null
					: data.salesInvoiceId,
			sourceId: null,
			sourceModule: null,
			status: data.status || "DRAFT",
		};

		const newLines: NewJournalLine[] = data.lines.map((line, index) => ({
			accountId: line.accountId,
			credit: line.credit,
			debit: line.debit,
			department: null,
			lineOrder: index + 1,
			memo: line.memo ?? null,
			project: null,
		}));

		return this.journalRepo.create(journal, newLines);
	}

	async updateJournal(
		id: string,
		data: {
			journalDate: Date;
			description: string;
			status?: "DRAFT" | "POSTED";
			salesInvoiceId?: string;
			lines: {
				accountId: string;
				debit: number;
				credit: number;
				memo?: string;
			}[];
		},
	) {
		const existing = await this.journalRepo.findById(id);
		if (!existing) {
			throw new NotFoundError("Journal not found");
		}

		if (existing.status !== "DRAFT") {
			throw new BadRequestError("Only draft journals can be updated");
		}

		if (data.lines.length < 2) {
			throw new BadRequestError("Journal must have at least two lines");
		}

		const totalDebit = data.lines.reduce(
			(sum, line) => sum + Number(line.debit),
			0,
		);
		const totalCredit = data.lines.reduce(
			(sum, line) => sum + Number(line.credit),
			0,
		);

		if (totalDebit !== totalCredit) {
			throw new BadRequestError("Total debit must equal total credit");
		}
		if (totalDebit <= 0) {
			throw new BadRequestError("Total amount must be positive");
		}

		const journal: Partial<NewJournal> = {
			description: data.description,
			journalDate: data.journalDate,
			salesInvoiceId:
				data.salesInvoiceId === "" ? undefined : data.salesInvoiceId,
			status: data.status || "DRAFT",
		};

		const newLines: NewJournalLine[] = data.lines.map((line, index) => ({
			accountId: line.accountId,
			credit: line.credit,
			debit: line.debit,
			department: null,
			lineOrder: index + 1,
			memo: line.memo ?? null,
			project: null,
		}));

		return this.journalRepo.update(id, journal, newLines);
	}

	async reverseJournal(id: string, reason: string) {
		if (!reason || reason.trim() === "") {
			throw new BadRequestError("Reversal reason is required");
		}

		const originalJournal = await this.journalRepo.findById(id);
		if (!originalJournal) {
			throw new NotFoundError("Journal not found");
		}

		if (originalJournal.status !== "POSTED") {
			throw new BadRequestError("Only posted journals can be reversed");
		}

		const year = new Date().getFullYear();
		const prefix = `JU-${year}`;
		const journalNumber = await this.journalRepo.findNextJournalNumber(prefix);

		const reversedJournal: NewJournal = {
			description: `Reversal of ${originalJournal.journalNumber}`,
			journalDate: new Date(),
			journalNumber,
			postedAt: new Date(),
			reversalReason: reason,
			reversedFromId: originalJournal.id,
			salesInvoiceId: null,
			sourceId: null,
			sourceModule: null,
			status: "POSTED",
		};

		const reversedLines: NewJournalLine[] = originalJournal.lines.map(
			(line) => ({
				accountId: line.accountId,
				credit: line.debit,
				debit: line.credit,
				department: line.department,
				lineOrder: line.lineOrder,
				memo: `Reversal of ${originalJournal.journalNumber}`,
				project: line.project,
			}),
		);

		const newJournal = await this.journalRepo.create(
			reversedJournal,
			reversedLines,
		);

		await this.journalRepo.updateStatus(
			originalJournal.id as string,
			"REVERSED",
			reason,
		);

		return newJournal;
	}
}
