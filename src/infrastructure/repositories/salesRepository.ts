import { isNull } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

import type { ISalesRepository } from "~/application/repositories/salesRepository";
import * as schema from "~/infrastructure/models";

export class SalesRepository implements ISalesRepository {
	constructor(private db: MySql2Database<typeof schema>) {}

	async findAll(): Promise<schema.SalesInvoice[]> {
		return this.db
			.select()
			.from(schema.salesInvoices)
			.where(isNull(schema.salesInvoices.deletedAt));
	}
}
