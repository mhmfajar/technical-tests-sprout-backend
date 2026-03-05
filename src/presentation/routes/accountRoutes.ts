import { Router } from "express";

import { AccountService } from "~/application/services/accountService";
import { db } from "~/infrastructure/database";
import { AccountRepository } from "~/infrastructure/repositories/accountRepository";
import { AccountController } from "~/presentation/controllers/accountController";
import { authMiddleware } from "~/presentation/middleware/authMiddleware";
import { validate } from "~/presentation/middleware/validationMiddleware";
import {
	createAccountSchema,
	updateAccountSchema,
} from "~/presentation/schemas/accountSchema";

const router = Router();

const accountRepository = new AccountRepository(db);
const accountService = new AccountService(accountRepository);
const accountController = new AccountController(accountService);

router.use(authMiddleware);

router.get("/", accountController.getAllAccounts);
router.get("/postable", accountController.getPostableAccounts);
router.post(
	"/",
	validate(createAccountSchema),
	accountController.createAccount,
);
router.put(
	"/:id",
	validate(updateAccountSchema),
	accountController.updateAccount,
);
router.delete("/:id", accountController.deleteAccount);

export default router;
