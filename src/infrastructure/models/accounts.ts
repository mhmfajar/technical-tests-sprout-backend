import { randomUUID } from "node:crypto";
import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	index,
	int,
	mysqlTable,
	uniqueIndex,
	varchar,
} from "drizzle-orm/mysql-core";

import { auditColumns } from "./audit";
import { cashDisbursementLines, cashReceiptLines } from "./cash";
import { accountTypeEnum } from "./enums";
import { journalLines } from "./journals";

export const accounts = mysqlTable(
	"accounts",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		parentId: varchar("parent_id", { length: 36 }),
		code: varchar("code", { length: 20 }).notNull(),
		name: varchar("name", { length: 255 }).notNull(),
		level: int("level").notNull().default(0),
		type: accountTypeEnum("type").notNull(),
		balance: decimal("balance", { precision: 20, scale: 2 })
			.notNull()
			.default("0"),
		isSystem: boolean("is_system").notNull().default(false),
		isControl: boolean("is_control").notNull().default(false),
		...auditColumns,
	},
	(t) => [
		uniqueIndex("accounts_code_unique_idx").on(t.code),
		index("accounts_deleted_at_idx").on(t.deletedAt),
		index("accounts_parent_idx").on(t.parentId),
		index("accounts_type_idx").on(t.type),
	],
);

export const accountsRelations = relations(accounts, ({ one, many }) => ({
	cashDisbursementLines: many(cashDisbursementLines),
	cashReceiptLines: many(cashReceiptLines),
	children: many(accounts, { relationName: "account_children" }),
	journalLines: many(journalLines),
	parent: one(accounts, {
		fields: [accounts.parentId],
		references: [accounts.id],
		relationName: "account_children",
	}),
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
