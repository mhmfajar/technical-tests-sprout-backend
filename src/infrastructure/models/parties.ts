import { randomUUID } from "node:crypto";
import { relations } from "drizzle-orm";
import { index, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { arPayments } from "./ar";
import { auditColumns } from "./audit";
import { salesInvoices } from "./sales";

export const customers = mysqlTable(
	"customers",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		name: varchar("name", { length: 255 }).notNull(),
		taxIdNumber: varchar("tax_id_number", { length: 30 }),
		address: text("address"),
		email: varchar("email", { length: 255 }),
		phone: varchar("phone", { length: 50 }),
		...auditColumns,
	},
	(t) => [
		index("customers_deleted_at_idx").on(t.deletedAt),
		index("customers_name_idx").on(t.name),
	],
);

export const customersRelations = relations(customers, ({ many }) => ({
	arPayments: many(arPayments),
	salesInvoices: many(salesInvoices),
}));

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
