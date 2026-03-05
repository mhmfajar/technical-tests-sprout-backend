import type { Customer } from "~/infrastructure/models/parties";

export interface IPartyRepository {
	findAllCustomers(q?: string): Promise<Customer[]>;
	findCustomerById(id: string): Promise<Customer | null>;
}
