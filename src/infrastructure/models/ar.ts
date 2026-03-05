import { randomUUID } from "node:crypto";
import { relations } from "drizzle-orm";
import {
	date,
	decimal,
	index,
	mysqlTable,
	varchar,
} from "drizzle-orm/mysql-core";

import { accounts } from "./accounts";
import { auditColumns } from "./audit";
import { journals } from "./journals";
import { customers } from "./parties";
import { salesInvoices } from "./sales";

export const arPayments = mysqlTable(
	"ar_payments",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		customerId: varchar("customer_id", { length: 36 })
			.notNull()
			.references(() => customers.id),
		depositAccountId: varchar("deposit_account_id", { length: 36 })
			.notNull()
			.references(() => accounts.id),
		discountAccountId: varchar("discount_account_id", {
			length: 36,
		}).references(() => accounts.id),
		journalId: varchar("journal_id", { length: 36 }).references(
			() => journals.id,
		),
		paymentDate: date("payment_date").notNull(),
		discountPercent: decimal("discount_percent", { precision: 5, scale: 2 })
			.notNull()
			.default("0"),
		totalAllocated: decimal("total_allocated", { precision: 20, scale: 2 })
			.notNull()
			.default("0"),
		totalReceived: decimal("total_received", {
			precision: 20,
			scale: 2,
		}).notNull(),
		...auditColumns,
	},
	(t) => [
		index("ar_payments_customer_idx").on(t.customerId),
		index("ar_payments_date_idx").on(t.paymentDate),
		index("ar_payments_deleted_at_idx").on(t.deletedAt),
	],
);

export const arPaymentsRelations = relations(arPayments, ({ one, many }) => ({
	allocations: many(arPaymentAllocations),
	customer: one(customers, {
		fields: [arPayments.customerId],
		references: [customers.id],
	}),
	depositAccount: one(accounts, {
		fields: [arPayments.depositAccountId],
		references: [accounts.id],
	}),
	discountAccount: one(accounts, {
		fields: [arPayments.discountAccountId],
		references: [accounts.id],
	}),
	journal: one(journals, {
		fields: [arPayments.journalId],
		references: [journals.id],
	}),
}));

export const arPaymentAllocations = mysqlTable(
	"ar_payment_allocations",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		arPaymentId: varchar("ar_payment_id", { length: 36 })
			.notNull()
			.references(() => arPayments.id, { onDelete: "cascade" }),
		salesInvoiceId: varchar("sales_invoice_id", { length: 36 })
			.notNull()
			.references(() => salesInvoices.id),
		allocatedAmount: decimal("allocated_amount", {
			precision: 20,
			scale: 2,
		}).notNull(),
		discountAmount: decimal("discount_amount", { precision: 20, scale: 2 })
			.notNull()
			.default("0"),
		...auditColumns,
	},
	(t) => [
		index("ar_payment_allocations_invoice_idx").on(t.salesInvoiceId),
		index("ar_payment_allocations_payment_idx").on(t.arPaymentId),
	],
);

export const arPaymentAllocationsRelations = relations(
	arPaymentAllocations,
	({ one }) => ({
		arPayment: one(arPayments, {
			fields: [arPaymentAllocations.arPaymentId],
			references: [arPayments.id],
		}),
		salesInvoice: one(salesInvoices, {
			fields: [arPaymentAllocations.salesInvoiceId],
			references: [salesInvoices.id],
		}),
	}),
);

export type ArPayment = typeof arPayments.$inferSelect;
export type NewArPayment = typeof arPayments.$inferInsert;
export type ArPaymentAllocation = typeof arPaymentAllocations.$inferSelect;
export type NewArPaymentAllocation = typeof arPaymentAllocations.$inferInsert;
