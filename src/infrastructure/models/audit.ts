import { timestamp, varchar } from "drizzle-orm/mysql-core";

export const auditColumns = {
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedBy: varchar("deleted_by", { length: 36 }),
	createdBy: varchar("created_by", { length: 36 }),
	deletedAt: timestamp("deleted_at"),
	updatedBy: varchar("updated_by", { length: 36 }),
} as const;

export type AuditColumns = {
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	createdBy: string | null;
	updatedBy: string | null;
	deletedBy: string | null;
};
