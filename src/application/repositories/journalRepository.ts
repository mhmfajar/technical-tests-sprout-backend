import type { Journal, NewJournal, NewJournalLine } from "~/domain/journal";

export interface IJournalRepository {
	create(journal: NewJournal, lines: NewJournalLine[]): Promise<Journal>;
	findAll(q?: string): Promise<Journal[]>;
	findById(id: string): Promise<Journal | null>;
	findNextJournalNumber(prefix: string): Promise<string>;
	update(
		id: string,
		journal: Partial<NewJournal>,
		lines: NewJournalLine[],
	): Promise<Journal>;
	updateStatus(
		id: string,
		status: "DRAFT" | "POSTED" | "REVERSED",
		reversalReason?: string,
	): Promise<Journal>;
}
