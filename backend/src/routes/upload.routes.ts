import { Router } from "express";
import multer from "multer";
import path from "path";

import { uploadImage } from "../controllers/upload.controller";
import { protect, requireAdmin } from "../middlewares/auth.middleware";

const uploadsDir = path.resolve(process.cwd(), "uploads");
const useCloudinary =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeOriginal}`);
  }
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const upload = multer({
  storage: useCloudinary ? multer.memoryStorage() : diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("Only image files are allowed"));
      return;
    }

    cb(null, true);
  }
});

const router = Router();

router.post("/image", protect, requireAdmin, upload.single("image"), uploadImage);

export default router;
