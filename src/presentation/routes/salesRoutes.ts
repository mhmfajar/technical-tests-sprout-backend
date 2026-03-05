import { Router } from "express";

import { SalesService } from "~/application/services/salesService";
import { db } from "~/infrastructure/database";
import { SalesRepository } from "~/infrastructure/repositories/salesRepository";
import { SalesController } from "~/presentation/controllers/salesController";
import { authMiddleware } from "~/presentation/middleware/authMiddleware";

const router = Router();

const salesRepository = new SalesRepository(db);
const salesService = new SalesService(salesRepository);
const salesController = new SalesController(salesService);

router.use(authMiddleware);

router.get("/invoices", salesController.getAllInvoices);

export default router;
