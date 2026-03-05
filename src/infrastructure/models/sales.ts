import { randomUUID } from "node:crypto";
import { relations } from "drizzle-orm";
import {
	date,
	decimal,
	index,
	mysqlTable,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/mysql-core";

import { arPaymentAllocations } from "./ar";
import { auditColumns } from "./audit";
import { invoiceStatusEnum } from "./enums";
import { customers } from "./parties";

export const salesInvoices = mysqlTable(
	"sales_invoices",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		customerId: varchar("customer_id", { length: 36 })
			.notNull()
			.references(() => customers.id),
		invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
		invoiceDate: date("invoice_date").notNull(),
		dueDate: date("due_date").notNull(),
		subtotal: decimal("subtotal", { precision: 20, scale: 2 }).notNull(),
		taxAmount: decimal("tax_amount", { precision: 20, scale: 2 })
			.notNull()
			.default("0"),
		totalAmount: decimal("total_amount", { precision: 20, scale: 2 }).notNull(),
		paidAmount: decimal("paid_amount", { precision: 20, scale: 2 })
			.notNull()
			.default("0"),
		remainingAmount: decimal("remaining_amount", {
			precision: 20,
			scale: 2,
		}).notNull(),
		status: invoiceStatusEnum("status").notNull().default("OPEN"),
		notes: text("notes"),
		...auditColumns,
	},
	(t) => [
		index("sales_invoice_customer_idx").on(t.customerId),
		index("sales_invoice_deleted_at_idx").on(t.deletedAt),
		index("sales_invoice_due_date_idx").on(t.dueDate),
		uniqueIndex("sales_invoice_number_unique_idx").on(t.invoiceNumber),
		index("sales_invoice_status_idx").on(t.status),
	],
);

export const salesInvoicesRelations = relations(
	salesInvoices,
	({ one, many }) => ({
		arPaymentAllocations: many(arPaymentAllocations),
		customer: one(customers, {
			fields: [salesInvoices.customerId],
			references: [customers.id],
		}),
		lineItems: many(salesInvoiceLines),
	}),
);

export const salesInvoiceLines = mysqlTable(
	"sales_invoice_lines",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		salesInvoiceId: varchar("sales_invoice_id", { length: 36 })
			.notNull()
			.references(() => salesInvoices.id, { onDelete: "cascade" }),
		itemName: varchar("item_name", { length: 255 }).notNull(),
		quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
		unitPrice: decimal("unit_price", { precision: 20, scale: 2 }).notNull(),
		totalPrice: decimal("total_price", { precision: 20, scale: 2 }).notNull(),
		...auditColumns,
	},
	(t) => [index("sales_invoice_lines_invoice_idx").on(t.salesInvoiceId)],
);

export const salesInvoiceLinesRelations = relations(
	salesInvoiceLines,
	({ one }) => ({
		salesInvoice: one(salesInvoices, {
			fields: [salesInvoiceLines.salesInvoiceId],
			references: [salesInvoices.id],
		}),
	}),
);

export type SalesInvoice = typeof salesInvoices.$inferSelect;
export type NewSalesInvoice = typeof salesInvoices.$inferInsert;
export type SalesInvoiceLine = typeof salesInvoiceLines.$inferSelect;
export type NewSalesInvoiceLine = typeof salesInvoiceLines.$inferInsert;
