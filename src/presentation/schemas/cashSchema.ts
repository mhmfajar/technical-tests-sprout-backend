import { z } from "zod";

export const createReceiptSchema = z.object({
	depositAccountId: z.string().min(1, "Account ID is required"),
	lines: z
		.array(
			z.object({
				accountId: z.string().min(1, "Account ID is required for detail line"),
				amount: z.number().positive("Amount must be positive"),
				department: z.string().optional(),
				memo: z.string().optional(),
				project: z.string().optional(),
			}),
		)
		.min(1, "At least one detail line is required"),
	memo: z.string().min(1, "Memo is required"),
	receiptDate: z.string().datetime().or(z.date()),
});

export const createDisbursementSchema = z.object({
	chequeNumber: z.string().optional(),
	disbursementDate: z.string().datetime().or(z.date()),
	isBlankCheque: z.boolean().optional(),
	lines: z
		.array(
			z.object({
				accountId: z.string().min(1, "Account ID is required for detail line"),
				amount: z.number().positive("Amount must be positive"),
				department: z.string().optional(),
				memo: z.string().optional(),
				project: z.string().optional(),
			}),
		)
		.min(1, "At least one detail line is required"),
	memo: z.string().min(1, "Memo is required"),
	paidFromAccountId: z.string().min(1, "Account ID is required"),
	payeeName: z.string().min(1, "Payee name is required"),
});
