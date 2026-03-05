export type JournalStatus = "DRAFT" | "POSTED" | "REVERSED";

export class JournalLine {
	constructor(
		public readonly id: string | null,
		public journalId: string,
		public accountId: string,
		public debit: number,
		public credit: number,
		public memo: string | null,
		public department: string | null,
		public project: string | null,
		public lineOrder: number,
	) {}
}

export type NewJournalLine = Omit<JournalLine, "id" | "journalId">;

export class Journal {
	constructor(
		public readonly id: string | null,
		public salesInvoiceId: string | null,
		public reversedFromId: string | null,
		public sourceId: string | null,
		public journalNumber: string,
		public journalDate: Date,
		public description: string,
		public status: JournalStatus,
		public reversalReason: string | null,
		public sourceModule: string | null,
		public postedAt: Date | null,
		public readonly lines: JournalLine[],
	) {}
}

export type NewJournal = Omit<Journal, "id" | "lines">;
