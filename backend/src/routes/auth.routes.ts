import { Router } from "express";

import {
	changePassword,
	getAllUsers,
	loginAdmin,
	registerAdmin,
	updateUserRole
} from "../controllers/auth.controller";
import { protect, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", loginAdmin);
router.patch("/change-password", protect, changePassword);
router.post("/register-admin", protect, requireAdmin, registerAdmin);
router.get("/users", protect, requireAdmin, getAllUsers);
router.patch("/users/:id/role", protect, requireAdmin, updateUserRole);

export default router;
