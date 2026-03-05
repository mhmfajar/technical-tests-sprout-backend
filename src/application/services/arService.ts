import type { IAccountRepository } from "~/application/repositories/accountRepository";
import type { IArRepository } from "~/application/repositories/arRepository";
import type { IJournalRepository } from "~/application/repositories/journalRepository";
import type { NewArPayment, NewArPaymentAllocation } from "~/domain/ar";
import { BadRequestError } from "~/domain/errors/AppError";
import type { NewJournal, NewJournalLine } from "~/domain/journal";

export class ArService {
	constructor(
		private arRepo: IArRepository,
		private accountRepo: IAccountRepository,
		private journalRepo: IJournalRepository,
	) {}

	async getDashboardSummary() {
		return this.arRepo.getDashboardSummary();
	}

	async getPayableInvoices(customerId: string) {
		return this.arRepo.findUnpaidInvoicesByCustomer(customerId);
	}

	async getAllUnpaidInvoices() {
		return this.arRepo.findAllUnpaidInvoices();
	}

	async recordPayment(data: {
		customerId: string;
		depositAccountId: string;
		discountAccountId?: string;
		paymentDate: Date;
		discountPercent?: number;
		totalReceived: number;
		allocations: {
			salesInvoiceId: string;
			allocatedAmount: number;
			discountAmount?: number;
		}[];
	}) {
		if (data.allocations.length === 0) {
			throw new BadRequestError(
				"At least one invoice must be selected for payment",
			);
		}

		const totalAllocated = data.allocations.reduce(
			(sum, a) => sum + a.allocatedAmount,
			0,
		);
		const totalDiscount = data.allocations.reduce(
			(sum, a) => sum + (a.discountAmount || 0),
			0,
		);

		if (totalAllocated === 0) {
			throw new BadRequestError("Total allocated amount cannot be zero");
		}

		const year = new Date().getFullYear();
		const journalPrefix = `JU-${year}`;
		const journalNumber =
			await this.journalRepo.findNextJournalNumber(journalPrefix);

		const piutangAccount = await this.accountRepo.findByCode("112.000");
		if (!piutangAccount || !piutangAccount.id) {
			throw new BadRequestError("Piutang Usaha account (112.000) not found");
		}
		const piutangAccountId = piutangAccount.id;

		const journal: NewJournal = {
			description: `Payment from customer for ${data.allocations.length} invoices`,
			journalDate: data.paymentDate,
			journalNumber,
			postedAt: new Date(),
			reversalReason: null,
			reversedFromId: null,
			salesInvoiceId: null,
			sourceId: null,
			sourceModule: "AR_PAYMENT",
			status: "POSTED",
		};

		const journalLines: NewJournalLine[] = [
			{
				accountId: data.depositAccountId,
				credit: 0,
				debit: data.totalReceived,
				department: null,
				lineOrder: 1,
				memo: `Payment received`,
				project: null,
			},
			{
				accountId: piutangAccountId,
				credit: totalAllocated + totalDiscount,
				debit: 0,
				department: null,
				lineOrder: 2,
				memo: `Piutang Usaha reduction`,
				project: null,
			},
		];

		if (totalDiscount > 0 && data.discountAccountId) {
			journalLines.push({
				accountId: data.discountAccountId,
				credit: 0,
				debit: totalDiscount,
				department: null,
				lineOrder: 3,
				memo: `Sales discount applied`,
				project: null,
			});
		}

		const createdJournal = await this.journalRepo.create(journal, journalLines);

		const payment: NewArPayment = {
			customerId: data.customerId,
			depositAccountId: data.depositAccountId,
			discountAccountId: data.discountAccountId || null,
			discountPercent: data.discountPercent || 0,
			journalId: createdJournal.id,
			paymentDate: data.paymentDate,
			totalAllocated: totalAllocated,
			totalReceived: data.totalReceived,
		};

		const allocations: NewArPaymentAllocation[] = data.allocations.map((a) => ({
			allocatedAmount: a.allocatedAmount,
			discountAmount: a.discountAmount || 0,
			salesInvoiceId: a.salesInvoiceId,
		}));

		return this.arRepo.createPayment(payment, allocations);
	}
}
