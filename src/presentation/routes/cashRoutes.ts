import { Router } from "express";

import { CashService } from "~/application/services/cashService";
import { db } from "~/infrastructure/database";
import { AccountRepository } from "~/infrastructure/repositories/accountRepository";
import { CashRepository } from "~/infrastructure/repositories/cashRepository";
import { JournalRepository } from "~/infrastructure/repositories/journalRepository";
import { CashController } from "~/presentation/controllers/cashController";
import { authMiddleware } from "~/presentation/middleware/authMiddleware";
import { validate } from "~/presentation/middleware/validationMiddleware";
import {
	createDisbursementSchema,
	createReceiptSchema,
} from "~/presentation/schemas/cashSchema";

const router = Router();

const cashRepository = new CashRepository(db);
const accountRepository = new AccountRepository(db);
const journalRepository = new JournalRepository(db);
const cashService = new CashService(
	cashRepository,
	accountRepository,
	journalRepository,
);
const cashController = new CashController(cashService);

router.use(authMiddleware);

router.get("/receipts", cashController.getReceipts);
router.post(
	"/receipts",
	validate(createReceiptSchema),
	cashController.createReceipt,
);
router.get("/disbursements", cashController.getDisbursements);
router.post(
	"/disbursements",
	validate(createDisbursementSchema),
	cashController.createDisbursement,
);

export default router;
