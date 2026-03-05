import type { Account, NewAccount } from "~/domain/account";

export interface IAccountRepository {
	create(account: NewAccount): Promise<Account>;
	delete(id: string): Promise<void>;
	findAll(q?: string): Promise<Account[]>;
	findByCode(code: string): Promise<Account | null>;
	findById(id: string): Promise<Account | null>;
	findPostable(q?: string): Promise<Account[]>;
	update(id: string, data: Partial<NewAccount>): Promise<Account>;
}
