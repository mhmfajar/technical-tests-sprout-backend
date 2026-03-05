import { z } from "zod";

const journalLineSchema = z.object({
	accountId: z.string().min(1, "Account ID is required"),
	credit: z.coerce.number().min(0, "Credit must be 0 or positive"),
	debit: z.coerce.number().min(0, "Debit must be 0 or positive"),
	memo: z.string().optional(),
});

export const createJournalSchema = z
	.object({
		description: z.string().min(1, "Description is required"),
		journalDate: z.string().or(z.date()),
		lines: z
			.array(journalLineSchema)
			.min(2, "Journal must have at least two lines"),
		salesInvoiceId: z.string().optional(),
		status: z.enum(["DRAFT", "POSTED"]).optional(),
	})
	.refine(
		(data) => {
			const totalDebit = data.lines.reduce((sum, item) => sum + item.debit, 0);
			const totalCredit = data.lines.reduce(
				(sum, item) => sum + item.credit,
				0,
			);
			return Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;
		},
		{ message: "Total debit must equal total credit and be greater than 0" },
	);

export const updateJournalSchema = createJournalSchema;

export const reverseJournalSchema = z.object({
	reason: z.string().min(1, "Reversal reason is required"),
});
