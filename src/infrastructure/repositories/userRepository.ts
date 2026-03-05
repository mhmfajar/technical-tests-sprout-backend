import { eq } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

import type { IUserRepository } from "~/application/repositories/userRepository";
import { User } from "~/domain/user";
import * as schema from "~/infrastructure/models";

export class UserRepository implements IUserRepository {
	constructor(private db: MySql2Database<typeof schema>) {}

	async findByUsername(username: string): Promise<User | null> {
		try {
			const result = await this.db
				.select()
				.from(schema.users)
				.where(eq(schema.users.username, username))
				.limit(1);
			if (result.length === 0) return null;
			const userData = result[0];
			return new User(
				userData.id,
				userData.name,
				userData.username,
				userData.password,
			);
		} catch (err: unknown) {
			console.error("DATABASE ERROR IN findByUsername:", err);
			throw err;
		}
	}

	async findById(id: string): Promise<User | null> {
		try {
			const result = await this.db
				.select()
				.from(schema.users)
				.where(eq(schema.users.id, id))
				.limit(1);
			if (result.length === 0) return null;
			const userData = result[0];
			return new User(
				userData.id,
				userData.name,
				userData.username,
				userData.password,
			);
		} catch (err: unknown) {
			console.error("DATABASE ERROR IN findById:", err);
			throw err;
		}
	}

	async create(user: User): Promise<User> {
		await this.db.insert(schema.users).values({
			name: user.name,
			password: user.password,
			username: user.username,
		});

		const inserted = await this.db
			.select()
			.from(schema.users)
			.where(eq(schema.users.username, user.username))
			.limit(1);

		const userData = inserted[0];
		return new User(
			userData.id,
			userData.name,
			userData.username,
			userData.password,
		);
	}
}
