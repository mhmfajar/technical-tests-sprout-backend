import type { Request, Response } from "express";

import type { PartyService } from "~/application/services/partyService";
import { Controller } from "./controller";

export class PartyController extends Controller {
	constructor(private partyService: PartyService) {
		super();
	}

	getCustomers = async (req: Request, res: Response) => {
		try {
			const q = typeof req.query.q === "string" ? req.query.q : undefined;
			const customers = await this.partyService.getCustomers(q);
			res.status(200).json({ data: customers });
		} catch (error) {
			this.handleError(res, error);
		}
	};
}
