export type AccountType =
	| "ASSET"
	| "EXPENSE"
	| "EQUITY"
	| "LIABILITY"
	| "REVENUE";

export class Account {
	constructor(
		public readonly id: string | null,
		public parentId: string | null,
		public code: string,
		public name: string,
		public level: number,
		public type: AccountType,
		public balance: number,
		public isSystem: boolean,
		public isControl: boolean,
	) {}
}

export type NewAccount = Partial<
	Omit<Account, "id" | "isSystem" | "isControl">
> & {
	code: string;
	name: string;
	level: number;
	type: AccountType;
	balance?: number;
	isSystem?: boolean;
	isControl?: boolean;
};
