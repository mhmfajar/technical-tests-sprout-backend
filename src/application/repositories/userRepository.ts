import type { User } from "~/domain/user";

export interface IUserRepository {
	create(user: User): Promise<User>;
	findById(id: string): Promise<User | null>;
	findByUsername(username: string): Promise<User | null>;
}
