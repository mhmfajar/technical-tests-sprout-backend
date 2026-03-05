import { and, eq, isNull, like, or } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

import type { IPartyRepository } from "~/application/repositories/partyRepository";
import * as schema from "~/infrastructure/models";
import type { Customer } from "~/infrastructure/models/parties";

export class PartyRepository implements IPartyRepository {
	constructor(private db: MySql2Database<typeof schema>) {}

	async findAllCustomers(q?: string): Promise<Customer[]> {
		const notDeleted = isNull(schema.customers.deletedAt);
		const whereClause =
			q && q.trim() !== ""
				? and(
						notDeleted,
						or(
							like(schema.customers.name, `%${q}%`),
							like(schema.customers.taxIdNumber, `%${q}%`),
						),
					)
				: notDeleted;

		return await this.db.select().from(schema.customers).where(whereClause);
	}

	async findCustomerById(id: string): Promise<Customer | null> {
		const result = await this.db
			.select()
			.from(schema.customers)
			.where(
				and(isNull(schema.customers.deletedAt), eq(schema.customers.id, id)),
			)
			.limit(1);
		return result[0] || null;
	}
}
