import { Router } from "express";

import { ArService } from "~/application/services/arService";
import { db } from "~/infrastructure/database";
import { AccountRepository } from "~/infrastructure/repositories/accountRepository";
import { ArRepository } from "~/infrastructure/repositories/arRepository";
import { JournalRepository } from "~/infrastructure/repositories/journalRepository";
import { ArController } from "~/presentation/controllers/arController";
import { authMiddleware } from "~/presentation/middleware/authMiddleware";
import { validate } from "~/presentation/middleware/validationMiddleware";
import { createPaymentSchema } from "~/presentation/schemas/arSchema";

const router = Router();

const arRepository = new ArRepository(db);
const accountRepository = new AccountRepository(db);
const journalRepository = new JournalRepository(db);
const arService = new ArService(
	arRepository,
	accountRepository,
	journalRepository,
);
const arController = new ArController(arService);

router.use(authMiddleware);

router.get("/summary", arController.getDashboardSummary);
router.get("/unpaid-invoices", arController.getAllUnpaidInvoices);
router.get("/invoices/:customerId", arController.getPayableInvoices);
router.post(
	"/payments",
	validate(createPaymentSchema),
	arController.recordPayment,
);

export default router;
