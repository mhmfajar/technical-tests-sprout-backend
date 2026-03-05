import type { SalesInvoice } from "~/infrastructure/models/sales";

export interface ISalesRepository {
	findAll(): Promise<SalesInvoice[]>;
}
