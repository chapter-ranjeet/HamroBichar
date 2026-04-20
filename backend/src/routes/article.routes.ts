import { Router } from "express";

import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticleBySlug,
  updateArticle
} from "../controllers/article.controller";
import { protect, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllArticles);
router.get("/:slug", getArticleBySlug);
router.post("/", protect, requireAdmin, createArticle);
router.put("/:id", protect, requireAdmin, updateArticle);
router.delete("/:id", protect, requireAdmin, deleteArticle);

export default router;
