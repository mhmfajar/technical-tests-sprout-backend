import { randomUUID } from "node:crypto";
import {
	index,
	mysqlTable,
	uniqueIndex,
	varchar,
} from "drizzle-orm/mysql-core";

import { auditColumns } from "./audit";

export const users = mysqlTable(
	"users",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		name: varchar("name", { length: 255 }).notNull(),
		username: varchar("username", { length: 255 }).notNull(),
		password: varchar("password", { length: 255 }).notNull(),
		...auditColumns,
	},
	(t) => [
		index("users_deleted_at_idx").on(t.deletedAt),
		uniqueIndex("users_username_unique_idx").on(t.username),
	],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
