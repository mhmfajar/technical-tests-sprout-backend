import jwt, { type SignOptions } from "jsonwebtoken";

export interface TokenPayload {
	name: string;
	userId: string;
	username: string;
}

const SECRET = process.env.JWT_SECRET || "fallback-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

export function generateToken(payload: TokenPayload): string {
	const options: SignOptions = {
		expiresIn: EXPIRES_IN as SignOptions["expiresIn"],
	};
	return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
	return jwt.verify(token, SECRET) as TokenPayload;
}
