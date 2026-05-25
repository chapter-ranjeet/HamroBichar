import { Router } from "express";

import {
  createCertificate,
  deleteCertificate,
  getCertificateById,
  listCertificates
} from "../controllers/certificate.controller";
import { protect, requireSuperAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/verify/:certificateId", getCertificateById);
router.get("/", protect, requireSuperAdmin, listCertificates);
router.post("/", protect, requireSuperAdmin, createCertificate);
router.delete("/:id", protect, requireSuperAdmin, deleteCertificate);

export default router;