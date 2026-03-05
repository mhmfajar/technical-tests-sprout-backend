import type { ISalesRepository } from "~/application/repositories/salesRepository";
import type { SalesInvoice } from "~/infrastructure/models/sales";

export class SalesService {
	constructor(private salesRepository: ISalesRepository) {}

	async getAllInvoices(): Promise<SalesInvoice[]> {
		return this.salesRepository.findAll();
	}
}
