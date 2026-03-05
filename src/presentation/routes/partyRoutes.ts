import { Router } from "express";

import { PartyService } from "~/application/services/partyService";
import { db } from "~/infrastructure/database";
import { PartyRepository } from "~/infrastructure/repositories/partyRepository";
import { PartyController } from "~/presentation/controllers/partyController";
import { authMiddleware } from "~/presentation/middleware/authMiddleware";

const router = Router();

const partyRepository = new PartyRepository(db);
const partyService = new PartyService(partyRepository);
const partyController = new PartyController(partyService);

router.use(authMiddleware);

router.get("/customers", partyController.getCustomers);

export default router;
