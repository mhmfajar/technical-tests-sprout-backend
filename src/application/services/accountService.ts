import type { IAccountRepository } from "~/application/repositories/accountRepository";
import type { Account, NewAccount } from "~/domain/account";
import {
	BadRequestError,
	ConflictError,
	UnauthorizedError,
} from "~/domain/errors/AppError";

export class AccountService {
	constructor(private accountRepository: IAccountRepository) {}

	async getAllAccounts(q?: string): Promise<Account[]> {
		return this.accountRepository.findAll(q);
	}

	async getPostableAccounts(q?: string): Promise<Account[]> {
		return this.accountRepository.findPostable(q);
	}
	private async propagateBalanceChange(
		parentId: string | null | undefined,
		amountDiff: number,
	): Promise<void> {
		if (!parentId || amountDiff === 0) return;

		let currentParentId: string | null | undefined = parentId;
		while (currentParentId) {
			const parent = await this.accountRepository.findById(currentParentId);
			if (!parent) break;

			const newBalance = parent.balance + amountDiff;
			await this.accountRepository.update(parent.id as string, {
				balance: newBalance,
			});

			currentParentId = parent.parentId;
		}
	}

	async createAccount(data: {
		name: string;
		code: string;
		parentId: string;
	}): Promise<Account> {
		const existingCode = await this.accountRepository.findByCode(data.code);
		if (existingCode) {
			throw new ConflictError("Nomor Akun sudah digunakan");
		}

		if (!data.parentId) {
			throw new BadRequestError("Akun Induk (Parent Account) harus dipilih");
		}

		const parent = await this.accountRepository.findById(data.parentId);
		if (!parent) {
			throw new BadRequestError("Akun Induk tidak valid");
		}

		if (parent.balance !== 0) {
			throw new BadRequestError(
				"Tidak dapat menambahkan sub-akun karena akun induk memiliki saldo. Silakan pindahkan saldo induk ke akun lain melalui Jurnal Umum terlebih dahulu.",
			);
		}

		const newAccount: NewAccount = {
			balance: 0,
			code: data.code,
			isControl: false,
			isSystem: false,
			level: parent.level + 1,
			name: data.name,
			parentId: parent.id,
			type: parent.type,
		};

		const created = await this.accountRepository.create(newAccount);

		return created;
	}

	async updateAccount(
		id: string,
		data: { name: string; code: string; parentId: string },
	): Promise<Account> {
		const account = await this.accountRepository.findById(id);
		if (!account) {
			throw new BadRequestError("Akun tidak ditemukan");
		}

		if (account.isSystem || account.isControl) {
			throw new UnauthorizedError(
				"Tidak dapat mengubah akun sistem atau akun kontrol",
			);
		}

		if (data.code !== account.code) {
			const existingCode = await this.accountRepository.findByCode(data.code);
			if (existingCode) {
				throw new ConflictError("Nomor Akun sudah digunakan");
			}
		}

		const parent = await this.accountRepository.findById(data.parentId);
		if (!parent) {
			throw new BadRequestError("Akun Induk tidak valid");
		}

		if (parent.id === id) {
			throw new BadRequestError("Akun induk tidak boleh diri sendiri");
		}

		if (parent.id !== account.parentId && parent.balance !== 0) {
			throw new BadRequestError(
				"Tidak dapat memindahkan akun ke induk baru yang memiliki saldo. Silakan pastikan saldo induk baru bernilai nol.",
			);
		}

		const updates: Partial<NewAccount> = {
			code: data.code,
			level: parent.level + 1,
			name: data.name,
			parentId: parent.id,
			type: parent.type,
		};

		const updated = await this.accountRepository.update(id, updates);

		if (account.parentId !== parent.id) {
			const currentBalance = account.balance;
			if (currentBalance !== 0) {
				await this.propagateBalanceChange(account.parentId, -currentBalance);
				await this.propagateBalanceChange(parent.id, currentBalance);
			}
		}

		return updated;
	}

	async deleteAccount(id: string): Promise<void> {
		const account = await this.accountRepository.findById(id);
		if (!account) {
			throw new BadRequestError("Akun tidak ditemukan");
		}

		if (account.isSystem || account.isControl) {
			throw new UnauthorizedError(
				"Tidak dapat menghapus akun sistem atau akun kontrol",
			);
		}

		const deletedBalance = account.balance;
		await this.accountRepository.delete(id);

		if (deletedBalance !== 0) {
			await this.propagateBalanceChange(account.parentId, -deletedBalance);
		}
	}
}
