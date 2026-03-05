import type { IAccountRepository } from "~/application/repositories/accountRepository";
import type { ICashRepository } from "~/application/repositories/cashRepository";
import type { IJournalRepository } from "~/application/repositories/journalRepository";
import type {
	NewCashDisbursement,
	NewCashDisbursementLine,
	NewCashReceipt,
	NewCashReceiptLine,
} from "~/domain/cash";
import { BadRequestError } from "~/domain/errors/AppError";
import type { NewJournal, NewJournalLine } from "~/domain/journal";

export class CashService {
	constructor(
		private cashRepo: ICashRepository,
		private accountRepo: IAccountRepository,
		private journalRepo: IJournalRepository,
	) {}

	async getReceipts(q?: string) {
		return this.cashRepo.findAllReceipts(q);
	}

	async getDisbursements(q?: string) {
		return this.cashRepo.findAllDisbursements(q);
	}

	async createReceipt(data: {
		depositAccountId: string;
		receiptDate: Date;
		memo: string;
		lines: {
			accountId: string;
			amount: number;
			memo?: string;
			department?: string;
			project?: string;
		}[];
	}) {
		if (data.lines.length === 0) {
			throw new BadRequestError("At least one detail line is required");
		}

		const depositAccount = await this.accountRepo.findById(
			data.depositAccountId,
		);
		if (!depositAccount) {
			throw new BadRequestError("Invalid deposit account");
		}

		const totalAmount = data.lines.reduce((sum, line) => sum + line.amount, 0);
		if (totalAmount <= 0) {
			throw new BadRequestError("Total amount must be positive");
		}

		const year = new Date().getFullYear();
		const prefix = `KTMC-${year}`;
		const voucherNumber =
			await this.cashRepo.findNextReceiptVoucherNumber(prefix);

		const journalPrefix = `JU-${year}`;
		const journalNumber =
			await this.journalRepo.findNextJournalNumber(journalPrefix);

		const journal: NewJournal = {
			description: `Receipt ${voucherNumber}: ${data.memo}`,
			journalDate: data.receiptDate,
			journalNumber,
			postedAt: new Date(),
			reversalReason: null,
			reversedFromId: null,
			salesInvoiceId: null,
			sourceId: null,
			sourceModule: "CASH_RECEIPT",
			status: "POSTED",
		};

		const journalLines: NewJournalLine[] = [];

		journalLines.push({
			accountId: data.depositAccountId,
			credit: 0,
			debit: totalAmount,
			department: null,
			lineOrder: 1,
			memo: data.memo,
			project: null,
		});

		data.lines.forEach((line, index) => {
			journalLines.push({
				accountId: line.accountId,
				credit: line.amount,
				debit: 0,
				department: line.department ?? null,
				lineOrder: index + 2,
				memo: line.memo || data.memo,
				project: line.project ?? null,
			});
		});

		const createdJournal = await this.journalRepo.create(journal, journalLines);

		const receipt: NewCashReceipt = {
			depositAccountId: data.depositAccountId,
			journalId: createdJournal.id,
			memo: data.memo,
			receiptDate: data.receiptDate,
			totalAmount: totalAmount.toString(),
			voucherNumber,
		};

		const receiptLines: NewCashReceiptLine[] = data.lines.map(
			(line, index) =>
				({
					accountId: line.accountId,
					amount: line.amount.toString(),
					department: line.department,
					lineOrder: index + 1,
					memo: line.memo,
					project: line.project,
				}) as NewCashReceiptLine,
		);

		return this.cashRepo.createReceipt(receipt, receiptLines);
	}

	async createDisbursement(data: {
		paidFromAccountId: string;
		payeeName: string;
		disbursementDate: Date;
		memo: string;
		chequeNumber?: string;
		isBlankCheque?: boolean;
		lines: {
			accountId: string;
			amount: number;
			memo?: string;
			department?: string;
			project?: string;
		}[];
	}) {
		if (data.lines.length === 0) {
			throw new BadRequestError("At least one detail line is required");
		}

		const paidFromAccount = await this.accountRepo.findById(
			data.paidFromAccountId,
		);
		if (!paidFromAccount) {
			throw new BadRequestError("Invalid payment account");
		}

		const totalAmount = data.lines.reduce((sum, line) => sum + line.amount, 0);
		if (totalAmount <= 0) {
			throw new BadRequestError("Total amount must be positive");
		}

		const year = new Date().getFullYear();
		const prefix = `KK-${year}`;
		const voucherNumber =
			await this.cashRepo.findNextDisbursementVoucherNumber(prefix);

		const journalPrefix = `JU-${year}`;
		const journalNumber =
			await this.journalRepo.findNextJournalNumber(journalPrefix);

		const journal: NewJournal = {
			description: `Disbursement ${voucherNumber} to ${data.payeeName}: ${data.memo}`,
			journalDate: data.disbursementDate,
			journalNumber,
			postedAt: new Date(),
			reversalReason: null,
			reversedFromId: null,
			salesInvoiceId: null,
			sourceId: null,
			sourceModule: "CASH_DISBURSEMENT",
			status: "POSTED",
		};

		const journalLines: NewJournalLine[] = [];

		journalLines.push({
			accountId: data.paidFromAccountId,
			credit: totalAmount,
			debit: 0,
			department: null,
			lineOrder: 1,
			memo: data.memo,
			project: null,
		});

		data.lines.forEach((line, index) => {
			journalLines.push({
				accountId: line.accountId,
				credit: 0,
				debit: line.amount,
				department: line.department ?? null,
				lineOrder: index + 2,
				memo: line.memo || data.memo,
				project: line.project ?? null,
			});
		});

		const createdJournal = await this.journalRepo.create(journal, journalLines);

		const disbursement: NewCashDisbursement = {
			chequeNumber: data.chequeNumber,
			disbursementDate: data.disbursementDate,
			isBlankCheque: data.isBlankCheque || false,
			journalId: createdJournal.id,
			memo: data.memo,
			paidFromAccountId: data.paidFromAccountId,
			payeeName: data.payeeName,
			totalAmount: totalAmount.toString(),
			voucherNumber,
		};

		const disbursementLines: NewCashDisbursementLine[] = data.lines.map(
			(line, index) =>
				({
					accountId: line.accountId,
					amount: line.amount.toString(),
					department: line.department,
					lineOrder: index + 1,
					memo: line.memo,
					project: line.project,
				}) as NewCashDisbursementLine,
		);

		return this.cashRepo.createDisbursement(disbursement, disbursementLines);
	}
}
