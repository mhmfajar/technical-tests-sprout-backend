import type { IUserRepository } from "~/application/repositories/userRepository";
import { ConflictError, UnauthorizedError } from "~/domain/errors/AppError";
import { User } from "~/domain/user";
import { PasswordUtils } from "~/infrastructure/utils/password";
import { generateToken } from "~/infrastructure/utils/token";

export class UserService {
	constructor(private userRepository: IUserRepository) {}

	async registerUser(
		name: string,
		username: string,
		password: string,
	): Promise<User> {
		const existingUser = await this.userRepository.findByUsername(username);
		if (existingUser) {
			throw new ConflictError("User already exists");
		}

		const passwordUtils = new PasswordUtils();
		const hashedPassword = await passwordUtils.hash(password);
		const newUser = new User(null, name, username, hashedPassword);
		return this.userRepository.create(newUser);
	}

	async login(
		username: string,
		password: string,
	): Promise<{ user: User; token: string }> {
		const user = await this.userRepository.findByUsername(username);
		if (!user) {
			throw new UnauthorizedError("Invalid username or password");
		}

		const passwordUtils = new PasswordUtils();
		const isPasswordValid = await passwordUtils.compare(
			password,
			user.password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedError("Invalid username or password");
		}

		const token = generateToken({
			name: user.name,
			userId: user.id as string,
			username: user.username,
		});

		return { token, user };
	}

	async getUser(userId: string): Promise<User> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new UnauthorizedError("User not found");
		}
		return user;
	}
}
