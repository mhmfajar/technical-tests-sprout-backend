import { z } from "zod";

export const createAccountSchema = z.object({
	code: z.string().min(1, "Account code is required"),
	name: z.string().min(1, "Account name is required"),
	parent: z.string().min(1, "Parent account is required"),
});

export const updateAccountSchema = z.object({
	code: z.string().min(1, "Account code is required"),
	name: z.string().min(1, "Account name is required"),
	parent: z.string().min(1, "Parent account is required"),
});
