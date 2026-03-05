import { and, desc, eq, inArray, isNull, like, or } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

import type { ICashRepository } from "~/application/repositories/cashRepository";
import type {
	CashDisbursement,
	CashDisbursementLine,
	CashReceipt,
	CashReceiptLine,
	NewCashDisbursement,
	NewCashDisbursementLine,
	NewCashReceipt,
	NewCashReceiptLine,
} from "~/domain/cash";
import * as schema from "~/infrastructure/models";

export class CashRepository implements ICashRepository {
	constructor(private db: MySql2Database<typeof schema>) {}

	private toDomainReceipt(
		row: typeof schema.cashReceipts.$inferSelect,
		lines: (typeof schema.cashReceiptLines.$inferSelect)[],
	): CashReceipt {
		return {
			createdAt: row.createdAt ?? undefined,
			depositAccountId: row.depositAccountId,
			id: row.id,
			journalId: row.journalId,
			lines: lines.map((l) => ({ ...l })),
			memo: row.memo,
			receiptDate: row.receiptDate,
			totalAmount: row.totalAmount,
			updatedAt: row.updatedAt ?? undefined,
			voucherNumber: row.voucherNumber,
		};
	}

	private toDomainDisbursement(
		row: typeof schema.cashDisbursements.$inferSelect,
		lines: (typeof schema.cashDisbursementLines.$inferSelect)[],
	): CashDisbursement {
		return {
			chequeNumber: row.chequeNumber,
			createdAt: row.createdAt ?? undefined,
			disbursementDate: row.disbursementDate,
			id: row.id,
			isBlankCheque: row.isBlankCheque,
			journalId: row.journalId,
			lines: lines.map((l) => ({ ...l })),
			memo: row.memo,
			paidFromAccountId: row.paidFromAccountId,
			payeeName: row.payeeName,
			totalAmount: row.totalAmount,
			updatedAt: row.updatedAt ?? undefined,
			voucherNumber: row.voucherNumber,
		};
	}

	async createReceipt(
		receipt: NewCashReceipt,
		lines: NewCashReceiptLine[],
	): Promise<CashReceipt> {
		return await this.db.transaction(async (tx) => {
			await tx.insert(schema.cashReceipts).values(receipt);

			const insertedReceipts = await tx
				.select()
				.from(schema.cashReceipts)
				.where(eq(schema.cashReceipts.voucherNumber, receipt.voucherNumber))
				.limit(1);
			const insertedReceipt = insertedReceipts[0];

			if (!insertedReceipt) {
				throw new Error("Failed to create cash receipt");
			}

			const linesWithReceiptId = lines.map((line) => ({
				...line,
				cashReceiptId: insertedReceipt.id,
			}));

			await tx.insert(schema.cashReceiptLines).values(linesWithReceiptId);

			return this.toDomainReceipt(
				insertedReceipt,
				linesWithReceiptId as (typeof schema.cashReceiptLines.$inferSelect)[],
			);
		});
	}

	async createDisbursement(
		disbursement: NewCashDisbursement,
		lines: NewCashDisbursementLine[],
	): Promise<CashDisbursement> {
		return await this.db.transaction(async (tx) => {
			await tx.insert(schema.cashDisbursements).values(disbursement);

			const insertedDisbursements = await tx
				.select()
				.from(schema.cashDisbursements)
				.where(
					eq(
						schema.cashDisbursements.voucherNumber,
						disbursement.voucherNumber,
					),
				)
				.limit(1);
			const insertedDisbursement = insertedDisbursements[0];

			if (!insertedDisbursement) {
				throw new Error("Failed to create cash disbursement");
			}

			const linesWithDisbursementId = lines.map((line) => ({
				...line,
				cashDisbursementId: insertedDisbursement.id,
			}));

			await tx
				.insert(schema.cashDisbursementLines)
				.values(linesWithDisbursementId);

			return this.toDomainDisbursement(
				insertedDisbursement,
				linesWithDisbursementId as (typeof schema.cashDisbursementLines.$inferSelect)[],
			);
		});
	}

	async findAllReceipts(
		q?: string,
	): Promise<(CashReceipt & { lines: CashReceiptLine[] })[]> {
		const notDeleted = isNull(schema.cashReceipts.deletedAt);
		const whereClause =
			q && q.trim() !== ""
				? and(
						notDeleted,
						or(
							like(schema.cashReceipts.voucherNumber, `%${q}%`),
							like(schema.cashReceipts.memo, `%${q}%`),
						),
					)
				: notDeleted;

		const receipts = await this.db
			.select()
			.from(schema.cashReceipts)
			.where(whereClause)
			.orderBy(
				desc(schema.cashReceipts.receiptDate),
				desc(schema.cashReceipts.createdAt),
			);

		if (receipts.length === 0) return [];

		const receiptIds = receipts.map((r) => r.id);

		const allLines = await this.db
			.select()
			.from(schema.cashReceiptLines)
			.where(inArray(schema.cashReceiptLines.cashReceiptId, receiptIds));

		return receipts.map((receipt) =>
			this.toDomainReceipt(
				receipt,
				allLines.filter((line) => line.cashReceiptId === receipt.id),
			),
		) as (CashReceipt & { lines: CashReceiptLine[] })[];
	}

	async findAllDisbursements(
		q?: string,
	): Promise<(CashDisbursement & { lines: CashDisbursementLine[] })[]> {
		const notDeleted = isNull(schema.cashDisbursements.deletedAt);
		const whereClause =
			q && q.trim() !== ""
				? and(
						notDeleted,
						or(
							like(schema.cashDisbursements.voucherNumber, `%${q}%`),
							like(schema.cashDisbursements.memo, `%${q}%`),
							like(schema.cashDisbursements.payeeName, `%${q}%`),
						),
					)
				: notDeleted;

		const disbursements = await this.db
			.select()
			.from(schema.cashDisbursements)
			.where(whereClause)
			.orderBy(
				desc(schema.cashDisbursements.disbursementDate),
				desc(schema.cashDisbursements.createdAt),
			);

		if (disbursements.length === 0) return [];

		const disbursementIds = disbursements.map((d) => d.id);

		const allLines = await this.db
			.select()
			.from(schema.cashDisbursementLines)
			.where(
				inArray(
					schema.cashDisbursementLines.cashDisbursementId,
					disbursementIds,
				),
			);

		return disbursements.map((disbursement) =>
			this.toDomainDisbursement(
				disbursement,
				allLines.filter((line) => line.cashDisbursementId === disbursement.id),
			),
		) as (CashDisbursement & { lines: CashDisbursementLine[] })[];
	}

	async findNextReceiptVoucherNumber(prefix: string): Promise<string> {
		const results = await this.db
			.select()
			.from(schema.cashReceipts)
			.where(like(schema.cashReceipts.voucherNumber, `${prefix}%`))
			.orderBy(desc(schema.cashReceipts.voucherNumber))
			.limit(1);
		const result = results[0];

		if (!result) return `${prefix}-001`;

		const parts = result.voucherNumber.split("-");
		const lastNumberPart = parts.pop() || "0";
		const lastNumber = parseInt(lastNumberPart, 10);
		return `${prefix}-${String(lastNumber + 1).padStart(3, "0")}`;
	}

	async findNextDisbursementVoucherNumber(prefix: string): Promise<string> {
		const results = await this.db
			.select()
			.from(schema.cashDisbursements)
			.where(like(schema.cashDisbursements.voucherNumber, `${prefix}%`))
			.orderBy(desc(schema.cashDisbursements.voucherNumber))
			.limit(1);
		const result = results[0];

		if (!result) return `${prefix}-001`;

		const parts = result.voucherNumber.split("-");
		const lastNumberPart = parts.pop() || "0";
		const lastNumber = parseInt(lastNumberPart, 10);
		return `${prefix}-${String(lastNumber + 1).padStart(3, "0")}`;
	}
}
