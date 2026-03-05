import { and, eq, isNotNull, isNull, like, or } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

import type { IAccountRepository } from "~/application/repositories/accountRepository";
import { Account, type NewAccount } from "~/domain/account";
import * as schema from "~/infrastructure/models";

export class AccountRepository implements IAccountRepository {
	constructor(private db: MySql2Database<typeof schema>) {}

	private toDomain(row: {
		id: string;
		parentId: string | null;
		code: string;
		name: string;
		level: number;
		type: "ASSET" | "EXPENSE" | "EQUITY" | "LIABILITY" | "REVENUE";
		balance: string;
		isSystem: boolean;
		isControl: boolean;
	}): Account {
		return new Account(
			row.id,
			row.parentId,
			row.code,
			row.name,
			row.level,
			row.type,
			Number(row.balance),
			row.isSystem,
			row.isControl,
		);
	}

	async findAll(q?: string): Promise<Account[]> {
		const notDeleted = isNull(schema.accounts.deletedAt);
		const whereClause =
			q && q.trim() !== ""
				? and(
						notDeleted,
						or(
							like(schema.accounts.name, `%${q}%`),
							like(schema.accounts.code, `%${q}%`),
						),
					)
				: notDeleted;

		const rows = await this.db
			.select({
				balance: schema.accounts.balance,
				code: schema.accounts.code,
				id: schema.accounts.id,
				isControl: schema.accounts.isControl,
				isSystem: schema.accounts.isSystem,
				level: schema.accounts.level,
				name: schema.accounts.name,
				parentId: schema.accounts.parentId,
				type: schema.accounts.type,
			})
			.from(schema.accounts)
			.where(whereClause)
			.orderBy(schema.accounts.code);

		return rows.map((r) => this.toDomain(r));
	}

	async findPostable(q?: string): Promise<Account[]> {
		const notDeleted = isNull(schema.accounts.deletedAt);

		const whereClause =
			q && q.trim() !== ""
				? and(
						notDeleted,
						or(
							like(schema.accounts.name, `%${q}%`),
							like(schema.accounts.code, `%${q}%`),
						),
					)
				: notDeleted;

		const allAccounts = await this.db
			.select({
				balance: schema.accounts.balance,
				code: schema.accounts.code,
				id: schema.accounts.id,
				isControl: schema.accounts.isControl,
				isSystem: schema.accounts.isSystem,
				level: schema.accounts.level,
				name: schema.accounts.name,
				parentId: schema.accounts.parentId,
				type: schema.accounts.type,
			})
			.from(schema.accounts)
			.where(whereClause)
			.orderBy(schema.accounts.code);

		const activeParentIds = await this.db
			.select({ parentId: schema.accounts.parentId })
			.from(schema.accounts)
			.where(and(notDeleted, isNotNull(schema.accounts.parentId)));

		const parentIdSet = new Set(
			activeParentIds
				.map((a) => a.parentId)
				.filter((id): id is string => id !== null),
		);

		return allAccounts
			.filter((acc) => !parentIdSet.has(acc.id))
			.map((r) => this.toDomain(r));
	}

	async findById(id: string): Promise<Account | null> {
		const result = await this.db
			.select({
				balance: schema.accounts.balance,
				code: schema.accounts.code,
				id: schema.accounts.id,
				isControl: schema.accounts.isControl,
				isSystem: schema.accounts.isSystem,
				level: schema.accounts.level,
				name: schema.accounts.name,
				parentId: schema.accounts.parentId,
				type: schema.accounts.type,
			})
			.from(schema.accounts)
			.where(and(eq(schema.accounts.id, id), isNull(schema.accounts.deletedAt)))
			.limit(1);

		return result.length > 0 ? this.toDomain(result[0]) : null;
	}

	async findByCode(code: string): Promise<Account | null> {
		const result = await this.db
			.select({
				balance: schema.accounts.balance,
				code: schema.accounts.code,
				id: schema.accounts.id,
				isControl: schema.accounts.isControl,
				isSystem: schema.accounts.isSystem,
				level: schema.accounts.level,
				name: schema.accounts.name,
				parentId: schema.accounts.parentId,
				type: schema.accounts.type,
			})
			.from(schema.accounts)
			.where(
				and(eq(schema.accounts.code, code), isNull(schema.accounts.deletedAt)),
			)
			.limit(1);

		return result.length > 0 ? this.toDomain(result[0]) : null;
	}

	async create(account: NewAccount): Promise<Account> {
		const payload = {
			...account,
			balance: account.balance?.toString() ?? "0",
		};
		await this.db.insert(schema.accounts).values(payload);
		const inserted = await this.db
			.select()
			.from(schema.accounts)
			.where(eq(schema.accounts.code, account.code))
			.limit(1);
		return this.toDomain(inserted[0]);
	}

	async update(id: string, data: Partial<NewAccount>): Promise<Account> {
		const payload = {
			...data,
			balance: data.balance !== undefined ? data.balance.toString() : undefined,
			updatedAt: new Date(),
		};
		await this.db
			.update(schema.accounts)
			.set(payload)
			.where(eq(schema.accounts.id, id));

		const updated = await this.db
			.select()
			.from(schema.accounts)
			.where(eq(schema.accounts.id, id))
			.limit(1);
		return this.toDomain(updated[0]);
	}

	async delete(id: string): Promise<void> {
		await this.db
			.update(schema.accounts)
			.set({ deletedAt: new Date() })
			.where(eq(schema.accounts.id, id));
	}
}
