export interface CashReceiptLine {
	accountId: string;
	amount: string;
	cashReceiptId: string;
	createdAt?: Date;
	department?: string | null;
	id: string;
	lineOrder: number;
	memo?: string | null;
	project?: string | null;
	updatedAt?: Date;
}

export type NewCashReceiptLine = Omit<
	CashReceiptLine,
	"id" | "cashReceiptId" | "createdAt" | "updatedAt"
>;

export interface CashReceipt {
	createdAt?: Date;
	depositAccountId: string;
	id: string;
	journalId?: string | null;
	lines?: CashReceiptLine[];
	memo: string;
	receiptDate: Date;
	totalAmount: string;
	updatedAt?: Date;
	voucherNumber: string;
}

export type NewCashReceipt = Omit<
	CashReceipt,
	"id" | "lines" | "createdAt" | "updatedAt"
>;

export interface CashDisbursementLine {
	accountId: string;
	amount: string;
	cashDisbursementId: string;
	createdAt?: Date;
	department?: string | null;
	id: string;
	lineOrder: number;
	memo?: string | null;
	project?: string | null;
	updatedAt?: Date;
}

export type NewCashDisbursementLine = Omit<
	CashDisbursementLine,
	"id" | "cashDisbursementId" | "createdAt" | "updatedAt"
>;

export interface CashDisbursement {
	chequeNumber?: string | null;
	createdAt?: Date;
	disbursementDate: Date;
	id: string;
	isBlankCheque: boolean;
	journalId?: string | null;
	lines?: CashDisbursementLine[];
	memo: string;
	paidFromAccountId: string;
	payeeName: string;
	totalAmount: string;
	updatedAt?: Date;
	voucherNumber: string;
}

export type NewCashDisbursement = Omit<
	CashDisbursement,
	"id" | "lines" | "createdAt" | "updatedAt"
>;
