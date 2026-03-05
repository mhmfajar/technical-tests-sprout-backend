import { z } from "zod";

export const createPaymentSchema = z.object({
	allocations: z
		.array(
			z.object({
				allocatedAmount: z.coerce.number().min(0),
				discountAmount: z.coerce.number().min(0).optional(),
				salesInvoiceId: z.string().min(1, "Sales Invoice ID is required"),
			}),
		)
		.min(1, "At least one allocation is required"),
	customerId: z.string().min(1, "Customer ID is required"),
	depositAccountId: z.string().min(1, "Deposit Account ID is required"),
	discountAccountId: z.string().optional().nullable(),
	discountPercent: z.coerce.number().min(0).max(100).optional(),
	paymentDate: z.string().or(z.date()),
	totalReceived: z.coerce
		.number()
		.min(0, "Total received must be 0 or positive"),
});
