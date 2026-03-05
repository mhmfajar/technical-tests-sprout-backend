import { Router } from "express";

import { UserService } from "~/application/services/userService";
import { db } from "~/infrastructure/database";
import { UserRepository } from "~/infrastructure/repositories/userRepository";
import { UserController } from "~/presentation/controllers/userController";
import { authMiddleware } from "~/presentation/middleware/authMiddleware";
import { validate } from "~/presentation/middleware/validationMiddleware";
import { loginSchema, registerSchema } from "~/presentation/schemas/userSchema";

const router = Router();

const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("/register", validate(registerSchema), userController.register);
router.post("/login", validate(loginSchema), userController.login);
router.get("/me", authMiddleware, userController.getUser);

export default router;
