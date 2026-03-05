import { Router } from "express";

import { JournalService } from "~/application/services/journalService";
import { db } from "~/infrastructure/database";
import { JournalRepository } from "~/infrastructure/repositories/journalRepository";
import { JournalController } from "~/presentation/controllers/journalController";
import { authMiddleware } from "~/presentation/middleware/authMiddleware";
import { validate } from "~/presentation/middleware/validationMiddleware";
import {
	createJournalSchema,
	reverseJournalSchema,
	updateJournalSchema,
} from "~/presentation/schemas/journalSchema";

const router = Router();

const journalRepository = new JournalRepository(db);
const journalService = new JournalService(journalRepository);
const journalController = new JournalController(journalService);

router.use(authMiddleware);

router.get("/", journalController.getJournals);
router.post(
	"/",
	validate(createJournalSchema),
	journalController.createJournal,
);
router.put(
	"/:id",
	validate(updateJournalSchema),
	journalController.updateJournal,
);
router.get("/:id", journalController.getJournalById);
router.post(
	"/:id/reverse",
	validate(reverseJournalSchema),
	journalController.reverseJournal,
);

export default router;
