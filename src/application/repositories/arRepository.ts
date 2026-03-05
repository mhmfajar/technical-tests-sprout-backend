import type {
	ArPayment,
	NewArPayment,
	NewArPaymentAllocation,
} from "~/domain/ar";
import type { SalesInvoice } from "~/infrastructure/models/sales";

export interface IArRepository {
	createPayment(
		payment: NewArPayment,
		allocations: NewArPaymentAllocation[],
	): Promise<ArPayment>;
	findAllPayments(q?: string): Promise<ArPayment[]>;
	findAllUnpaidInvoices(): Promise<
		(SalesInvoice & { customer: { name: string } })[]
	>;
	findUnpaidInvoicesByCustomer(customerId: string): Promise<SalesInvoice[]>;
	getDashboardSummary(): Promise<{
		totalPiutang: number;
		totalJatuhTempo: number;
	}>;
}
