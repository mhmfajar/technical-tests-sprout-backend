export class User {
	constructor(
		public readonly id: string | null,
		public name: string,
		public username: string = "",
		public password: string = "",
	) {}

	public withoutPassword() {
		const { password, ...userWithoutPassword } = this;
		return userWithoutPassword;
	}
}
