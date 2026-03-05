import bcrypt from "bcryptjs";

export class PasswordUtils {
	private readonly SALT_ROUNDS = 10;

	async hash(password: string): Promise<string> {
		return bcrypt.hash(password, this.SALT_ROUNDS);
	}

	async compare(password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}
}
