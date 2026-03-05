export class ArPaymentAllocation {
	constructor(
		public readonly id: string | null,
		public arPaymentId: string,
		public salesInvoiceId: string,
		public allocatedAmount: number,
		public discountAmount: number,
	) {}
}

export type NewArPaymentAllocation = Omit<
	ArPaymentAllocation,
	"id" | "arPaymentId"
>;

export class ArPayment {
	constructor(
		public readonly id: string | null,
		public customerId: string,
		public depositAccountId: string,
		public discountAccountId: string | null,
		public journalId: string | null,
		public paymentDate: Date,
		public discountPercent: number,
		public totalAllocated: number,
		public totalReceived: number,
		public readonly allocations: ArPaymentAllocation[],
	) {}
}

export type NewArPayment = Omit<ArPayment, "id" | "allocations">;
