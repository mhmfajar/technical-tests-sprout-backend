import { randomUUID } from "node:crypto";
import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	decimal,
	foreignKey,
	index,
	int,
	mysqlTable,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/mysql-core";

import { accounts } from "./accounts";
import { auditColumns } from "./audit";
import { journals } from "./journals";

export const cashReceipts = mysqlTable(
	"cash_receipts",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		depositAccountId: varchar("deposit_account_id", { length: 36 })
			.notNull()
			.references(() => accounts.id),
		journalId: varchar("journal_id", { length: 36 }).references(
			() => journals.id,
		),
		voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
		receiptDate: date("receipt_date").notNull(),
		totalAmount: decimal("total_amount", { precision: 20, scale: 2 }).notNull(),
		memo: text("memo").notNull(),
		...auditColumns,
	},
	(t) => [
		index("cash_receipts_date_idx").on(t.receiptDate),
		index("cash_receipts_deleted_at_idx").on(t.deletedAt),
		uniqueIndex("cash_receipts_voucher_unique_idx").on(t.voucherNumber),
	],
);

export const cashReceiptsRelations = relations(
	cashReceipts,
	({ one, many }) => ({
		depositAccount: one(accounts, {
			fields: [cashReceipts.depositAccountId],
			references: [accounts.id],
		}),
		journal: one(journals, {
			fields: [cashReceipts.journalId],
			references: [journals.id],
		}),
		lines: many(cashReceiptLines),
	}),
);

export const cashReceiptLines = mysqlTable(
	"cash_receipt_lines",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		cashReceiptId: varchar("cash_receipt_id", { length: 36 })
			.notNull()
			.references(() => cashReceipts.id, { onDelete: "cascade" }),
		accountId: varchar("account_id", { length: 36 })
			.notNull()
			.references(() => accounts.id),
		amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
		memo: text("memo"),
		department: varchar("department", { length: 100 }),
		project: varchar("project", { length: 100 }),
		lineOrder: int("line_order").notNull().default(0),
		...auditColumns,
	},
	(t) => [index("cash_receipt_lines_receipt_idx").on(t.cashReceiptId)],
);

export const cashReceiptLinesRelations = relations(
	cashReceiptLines,
	({ one }) => ({
		account: one(accounts, {
			fields: [cashReceiptLines.accountId],
			references: [accounts.id],
		}),
		cashReceipt: one(cashReceipts, {
			fields: [cashReceiptLines.cashReceiptId],
			references: [cashReceipts.id],
		}),
	}),
);

export const cashDisbursements = mysqlTable(
	"cash_disbursements",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		paidFromAccountId: varchar("paid_from_account_id", { length: 36 })
			.notNull()
			.references(() => accounts.id),
		journalId: varchar("journal_id", { length: 36 }).references(
			() => journals.id,
		),
		voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
		payeeName: varchar("payee_name", { length: 255 }).notNull(),
		disbursementDate: date("disbursement_date").notNull(),
		chequeNumber: varchar("cheque_number", { length: 50 }),
		isBlankCheque: boolean("is_blank_cheque").notNull().default(false),
		totalAmount: decimal("total_amount", { precision: 20, scale: 2 }).notNull(),
		memo: text("memo").notNull(),
		...auditColumns,
	},
	(t) => [
		index("cash_disbursements_date_idx").on(t.disbursementDate),
		index("cash_disbursements_deleted_at_idx").on(t.deletedAt),
		uniqueIndex("cash_disbursements_voucher_unique_idx").on(t.voucherNumber),
	],
);

export const cashDisbursementsRelations = relations(
	cashDisbursements,
	({ one, many }) => ({
		journal: one(journals, {
			fields: [cashDisbursements.journalId],
			references: [journals.id],
		}),
		lines: many(cashDisbursementLines),
		paidFromAccount: one(accounts, {
			fields: [cashDisbursements.paidFromAccountId],
			references: [accounts.id],
		}),
	}),
);

export const cashDisbursementLines = mysqlTable(
	"cash_disbursement_lines",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		cashDisbursementId: varchar("cash_disbursement_id", {
			length: 36,
		}).notNull(),
		accountId: varchar("account_id", { length: 36 })
			.notNull()
			.references(() => accounts.id),
		amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
		memo: text("memo"),
		department: varchar("department", { length: 100 }),
		project: varchar("project", { length: 100 }),
		lineOrder: int("line_order").notNull().default(0),
		...auditColumns,
	},
	(t) => [
		index("cash_disbursement_lines_disbursement_idx").on(t.cashDisbursementId),
		foreignKey({
			name: "cdl_cash_disbursement_id_fk",
			columns: [t.cashDisbursementId],
			foreignColumns: [cashDisbursements.id],
		}).onDelete("cascade"),
	],
);

export const cashDisbursementLinesRelations = relations(
	cashDisbursementLines,
	({ one }) => ({
		account: one(accounts, {
			fields: [cashDisbursementLines.accountId],
			references: [accounts.id],
		}),
		cashDisbursement: one(cashDisbursements, {
			fields: [cashDisbursementLines.cashDisbursementId],
			references: [cashDisbursements.id],
		}),
	}),
);

export type CashReceipt = typeof cashReceipts.$inferSelect;
export type NewCashReceipt = typeof cashReceipts.$inferInsert;
export type CashReceiptLine = typeof cashReceiptLines.$inferSelect;
export type NewCashReceiptLine = typeof cashReceiptLines.$inferInsert;
export type CashDisbursement = typeof cashDisbursements.$inferSelect;
export type NewCashDisbursement = typeof cashDisbursements.$inferInsert;
export type CashDisbursementLine = typeof cashDisbursementLines.$inferSelect;
export type NewCashDisbursementLine = typeof cashDisbursementLines.$inferInsert;
