import { z } from "zod";

export const registerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	username: z.string().min(3, "Username must be at least 3 characters"),
});

export const loginSchema = z.object({
	password: z.string().min(1, "Password is required"),
	username: z.string().min(1, "Username is required"),
});
