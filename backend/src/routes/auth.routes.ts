import { Router } from "express";

import {
	changePassword,
	createSubAdmin,
	getAllUsers,
	loginAdmin,
	registerAdmin,
	updateUserRole
} from "../controllers/auth.controller";
import { protect, requireSuperAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", loginAdmin);
router.patch("/change-password", protect, changePassword);
router.post("/register-admin", protect, requireSuperAdmin, registerAdmin);
router.post("/subadmin", protect, requireSuperAdmin, createSubAdmin);
router.get("/users", protect, requireSuperAdmin, getAllUsers);
router.patch("/users/:id/role", protect, requireSuperAdmin, updateUserRole);

export default router;
