import { mysqlEnum } from "drizzle-orm/mysql-core";

export const ACCOUNT_TYPE_VALUES = [
	"ASSET",
	"LIABILITY",
	"EQUITY",
	"REVENUE",
	"EXPENSE",
] as const;
export const JOURNAL_STATUS_VALUES = [
	"DRAFT",
	"POSTED",
	"REVERSED",
	"CANCELED",
] as const;
export const CASH_TRANSACTION_TYPE_VALUES = [
	"RECEIPT",
	"DISBURSEMENT",
] as const;
export const INVOICE_STATUS_VALUES = [
	"OPEN",
	"PARTIALLY_PAID",
	"PAID",
	"CANCELED",
] as const;
export const TAX_INVOICE_STATUS_VALUES = [
	"DRAFT",
	"ISSUED",
	"CANCELLED",
	"VOIDED",
] as const;
export const PURCHASE_TAX_INVOICE_STATUS_VALUES = [
	"DRAFT",
	"POSTED",
	"PAID",
	"VOIDED",
] as const;

export const accountTypeEnum = (col: string) =>
	mysqlEnum(col, ACCOUNT_TYPE_VALUES);
export const journalStatusEnum = (col: string) =>
	mysqlEnum(col, JOURNAL_STATUS_VALUES);
export const cashTransactionTypeEnum = (col: string) =>
	mysqlEnum(col, CASH_TRANSACTION_TYPE_VALUES);
export const invoiceStatusEnum = (col: string) =>
	mysqlEnum(col, INVOICE_STATUS_VALUES);
export const taxInvoiceStatusEnum = (col: string) =>
	mysqlEnum(col, TAX_INVOICE_STATUS_VALUES);
export const purchaseTaxInvoiceStatusEnum = (col: string) =>
	mysqlEnum(col, PURCHASE_TAX_INVOICE_STATUS_VALUES);
