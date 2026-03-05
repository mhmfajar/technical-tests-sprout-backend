import { and, desc, eq, inArray, isNull, like, or } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

import type { IJournalRepository } from "~/application/repositories/journalRepository";
import {
	Journal,
	JournalLine,
	type JournalStatus,
	type NewJournal,
	type NewJournalLine,
} from "~/domain/journal";
import * as schema from "~/infrastructure/models";

export class JournalRepository implements IJournalRepository {
	constructor(private db: MySql2Database<typeof schema>) {}

	private toDomainJournalLine(
		row: typeof schema.journalLines.$inferSelect,
	): JournalLine {
		return new JournalLine(
			row.id,
			row.journalId,
			row.accountId,
			Number(row.debit),
			Number(row.credit),
			row.memo,
			row.department,
			row.project,
			row.lineOrder,
		);
	}

	private toDomainJournal(
		row: typeof schema.journals.$inferSelect,
		lines: (typeof schema.journalLines.$inferSelect)[],
	): Journal {
		return new Journal(
			row.id,
			row.salesInvoiceId,
			row.reversedFromId,
			row.sourceId,
			row.journalNumber,
			row.journalDate,
			row.description,
			row.status as JournalStatus,
			row.reversalReason,
			row.sourceModule,
			row.postedAt,
			lines.map((l) => this.toDomainJournalLine(l)),
		);
	}

	async findAll(q?: string): Promise<Journal[]> {
		const notDeleted = isNull(schema.journals.deletedAt);
		const whereClause =
			q && q.trim() !== ""
				? and(
						notDeleted,
						or(
							like(schema.journals.journalNumber, `%${q}%`),
							like(schema.journals.description, `%${q}%`),
						),
					)
				: notDeleted;

		const allJournals = await this.db
			.select()
			.from(schema.journals)
			.where(whereClause)
			.orderBy(
				desc(schema.journals.journalDate),
				desc(schema.journals.createdAt),
			);

		if (allJournals.length === 0) return [];

		const journalIds = allJournals.map((j) => j.id);

		const allLines = await this.db
			.select()
			.from(schema.journalLines)
			.where(inArray(schema.journalLines.journalId, journalIds));

		return allJournals.map((journal) =>
			this.toDomainJournal(
				journal,
				allLines.filter((line) => line.journalId === journal.id),
			),
		);
	}

	async findById(id: string): Promise<Journal | null> {
		const journals = await this.db
			.select()
			.from(schema.journals)
			.where(eq(schema.journals.id, id))
			.limit(1);

		if (journals.length === 0) return null;

		const journal = journals[0];
		const lines = await this.db
			.select()
			.from(schema.journalLines)
			.where(eq(schema.journalLines.journalId, journal.id));

		return this.toDomainJournal(journal, lines);
	}

	async create(journal: NewJournal, lines: NewJournalLine[]): Promise<Journal> {
		return await this.db.transaction(async (tx) => {
			await tx.insert(schema.journals).values(journal);

			const insertedJournals = await tx
				.select()
				.from(schema.journals)
				.where(eq(schema.journals.journalNumber, journal.journalNumber))
				.limit(1);
			const insertedJournal = insertedJournals[0];

			if (!insertedJournal) {
				throw new Error("Failed to create journal");
			}

			const linesWithJournalId = lines.map((line) => ({
				...line,
				credit: line.credit.toString(),
				debit: line.debit.toString(),
				journalId: insertedJournal.id,
			}));

			await tx.insert(schema.journalLines).values(linesWithJournalId);

			if (insertedJournal.status === "POSTED") {
				await this.applyJournalBalances(tx, linesWithJournalId);
			}

			const rawLines = await tx
				.select()
				.from(schema.journalLines)
				.where(eq(schema.journalLines.journalId, insertedJournal.id));

			return this.toDomainJournal(insertedJournal, rawLines);
		});
	}

	private async applyJournalBalances(
		tx: Parameters<
			Parameters<MySql2Database<typeof schema>["transaction"]>[0]
		>[0],
		lines: {
			accountId: string;
			debit: string | number;
			credit: string | number;
		}[],
	): Promise<void> {
		for (const line of lines) {
			await this.adjustAccountBalance(
				tx,
				line.accountId,
				Number(line.debit),
				Number(line.credit),
			);
		}
	}

	private async adjustAccountBalance(
		tx: Parameters<
			Parameters<MySql2Database<typeof schema>["transaction"]>[0]
		>[0],
		accountId: string,
		debit: number,
		credit: number,
	): Promise<void> {
		const account = (
			await tx
				.select()
				.from(schema.accounts)
				.where(eq(schema.accounts.id, accountId))
				.limit(1)
		)[0];

		if (!account) return;

		let change = 0;
		switch (account.type) {
			case "ASSET":
			case "EXPENSE":
				change = debit - credit;
				break;
			case "LIABILITY":
			case "EQUITY":
			case "REVENUE":
				change = credit - debit;
				break;
		}

		if (change === 0) return;

		const newBalance = Number(account.balance) + change;
		await tx
			.update(schema.accounts)
			.set({ balance: newBalance.toString(), updatedAt: new Date() })
			.where(eq(schema.accounts.id, accountId));

		if (account.parentId) {
			await this.adjustAccountBalance(tx, account.parentId, debit, credit);
		}
	}

	async updateStatus(
		id: string,
		status: "DRAFT" | "POSTED" | "REVERSED",
		reversalReason?: string,
	): Promise<Journal> {
		await this.db.transaction(async (tx) => {
			const updateData: {
				status: "DRAFT" | "POSTED" | "REVERSED";
				updatedAt: Date;
				postedAt?: Date;
				reversalReason?: string;
			} = { status, updatedAt: new Date() };
			if (status === "POSTED") {
				updateData.postedAt = new Date();
			}
			if (reversalReason) {
				updateData.reversalReason = reversalReason;
			}

			const existing = await tx
				.select()
				.from(schema.journals)
				.where(eq(schema.journals.id, id))
				.limit(1);

			if (existing.length === 0) return;

			const journal = existing[0];

			if (status === "POSTED" && journal.status !== "POSTED") {
				const lines = await tx
					.select()
					.from(schema.journalLines)
					.where(eq(schema.journalLines.journalId, id));
				await this.applyJournalBalances(tx, lines);
			}

			await tx
				.update(schema.journals)
				.set(updateData)
				.where(eq(schema.journals.id, id));
		});

		const updatedList = await this.db
			.select()
			.from(schema.journals)
			.where(eq(schema.journals.id, id))
			.limit(1);
		const updated = updatedList[0];
		if (!updated) {
			throw new Error("Failed to return updated journal status");
		}

		const lines = await this.db
			.select()
			.from(schema.journalLines)
			.where(eq(schema.journalLines.journalId, id));

		return this.toDomainJournal(updated, lines);
	}

	async update(
		id: string,
		journal: Partial<NewJournal>,
		lines: NewJournalLine[],
	): Promise<Journal> {
		return await this.db.transaction(async (tx) => {
			await tx
				.update(schema.journals)
				.set({ ...journal, updatedAt: new Date() })
				.where(eq(schema.journals.id, id));

			await tx
				.delete(schema.journalLines)
				.where(eq(schema.journalLines.journalId, id));

			const linesWithJournalId = lines.map((line) => ({
				...line,
				credit: line.credit.toString(),
				debit: line.debit.toString(),
				journalId: id,
			}));

			await tx.insert(schema.journalLines).values(linesWithJournalId);

			if (journal.status === "POSTED") {
				await this.applyJournalBalances(tx, linesWithJournalId);
			}

			const updatedList = await tx
				.select()
				.from(schema.journals)
				.where(eq(schema.journals.id, id))
				.limit(1);
			const updated = updatedList[0];
			if (!updated) {
				throw new Error("Failed to update journal");
			}

			const rawLines = await tx
				.select()
				.from(schema.journalLines)
				.where(eq(schema.journalLines.journalId, id));

			return this.toDomainJournal(updated, rawLines);
		});
	}

	async findNextJournalNumber(prefix: string): Promise<string> {
		const results = await this.db
			.select()
			.from(schema.journals)
			.where(like(schema.journals.journalNumber, `${prefix}%`))
			.orderBy(desc(schema.journals.journalNumber))
			.limit(1);
		const result = results[0];

		if (!result) return `${prefix}-001`;

		const lastNumber = parseInt(
			result.journalNumber.split("-").pop() || "0",
			10,
		);
		return `${prefix}-${String(lastNumber + 1).padStart(3, "0")}`;
	}
}
