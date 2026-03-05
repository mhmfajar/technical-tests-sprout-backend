import type {
	CashDisbursement,
	CashDisbursementLine,
	CashReceipt,
	CashReceiptLine,
	NewCashDisbursement,
	NewCashDisbursementLine,
	NewCashReceipt,
	NewCashReceiptLine,
} from "~/domain/cash";

export interface ICashRepository {
	createDisbursement(
		disbursement: NewCashDisbursement,
		lines: NewCashDisbursementLine[],
		journalId?: string,
	): Promise<CashDisbursement>;
	createReceipt(
		receipt: NewCashReceipt,
		lines: NewCashReceiptLine[],
		journalId?: string,
	): Promise<CashReceipt>;
	findAllDisbursements(
		q?: string,
	): Promise<(CashDisbursement & { lines: CashDisbursementLine[] })[]>;
	findAllReceipts(
		q?: string,
	): Promise<(CashReceipt & { lines: CashReceiptLine[] })[]>;
	findNextDisbursementVoucherNumber(prefix: string): Promise<string>;
	findNextReceiptVoucherNumber(prefix: string): Promise<string>;
}
