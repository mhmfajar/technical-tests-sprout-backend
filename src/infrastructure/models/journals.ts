import { randomUUID } from "node:crypto";
import { relations } from "drizzle-orm";
import {
	date,
	decimal,
	index,
	int,
	mysqlTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/mysql-core";

import { accounts } from "./accounts";
import { auditColumns } from "./audit";
import { journalStatusEnum } from "./enums";
import { salesInvoices } from "./sales";

export const journals = mysqlTable(
	"journals",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		salesInvoiceId: varchar("sales_invoice_id", { length: 36 }).references(
			() => salesInvoices.id,
		),
		reversedFromId: varchar("reversed_from_id", { length: 36 }),
		sourceId: varchar("source_id", { length: 36 }),
		journalNumber: varchar("journal_number", { length: 50 }).notNull(),
		journalDate: date("journal_date").notNull(),
		description: text("description").notNull(),
		status: journalStatusEnum("status").notNull().default("DRAFT"),
		reversalReason: text("reversal_reason"),
		sourceModule: varchar("source_module", { length: 50 }),
		postedAt: timestamp("posted_at"),
		...auditColumns,
	},
	(t) => [
		index("journal_date_idx").on(t.journalDate),
		index("journal_deleted_at_idx").on(t.deletedAt),
		uniqueIndex("journal_number_unique_idx").on(t.journalNumber),
		index("journal_source_idx").on(t.sourceModule, t.sourceId),
		index("journal_status_idx").on(t.status),
	],
);

export const journalsRelations = relations(journals, ({ one, many }) => ({
	lines: many(journalLines),
	reversedFrom: one(journals, {
		fields: [journals.reversedFromId],
		references: [journals.id],
		relationName: "journal_reversals",
	}),
	salesInvoice: one(salesInvoices, {
		fields: [journals.salesInvoiceId],
		references: [salesInvoices.id],
	}),
}));

export const journalLines = mysqlTable(
	"journal_lines",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		journalId: varchar("journal_id", { length: 36 })
			.notNull()
			.references(() => journals.id, { onDelete: "cascade" }),
		accountId: varchar("account_id", { length: 36 })
			.notNull()
			.references(() => accounts.id),
		debit: decimal("debit", { precision: 20, scale: 2 }).notNull().default("0"),
		credit: decimal("credit", { precision: 20, scale: 2 })
			.notNull()
			.default("0"),
		memo: text("memo"),
		department: varchar("department", { length: 100 }),
		project: varchar("project", { length: 100 }),
		lineOrder: int("line_order").notNull().default(0),
		...auditColumns,
	},
	(t) => [
		index("journal_lines_account_idx").on(t.accountId),
		index("journal_lines_journal_idx").on(t.journalId),
	],
);

export const journalLinesRelations = relations(journalLines, ({ one }) => ({
	account: one(accounts, {
		fields: [journalLines.accountId],
		references: [accounts.id],
	}),
	journal: one(journals, {
		fields: [journalLines.journalId],
		references: [journals.id],
	}),
}));

export type Journal = typeof journals.$inferSelect;
export type NewJournal = typeof journals.$inferInsert;
export type JournalLine = typeof journalLines.$inferSelect;
export type NewJournalLine = typeof journalLines.$inferInsert;
