import type { IPartyRepository } from "~/application/repositories/partyRepository";

export class PartyService {
	constructor(private partyRepo: IPartyRepository) {}

	async getCustomers(q?: string) {
		return await this.partyRepo.findAllCustomers(q);
	}
}
