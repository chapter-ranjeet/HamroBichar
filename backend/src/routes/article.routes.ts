import { Router } from "express";

import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticleBySlug,
  incrementArticleViews,
  updateArticle
} from "../controllers/article.controller";
import { createArticleComment, getArticleComments } from "../controllers/comment.controller";
import { protect, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllArticles);
router.post("/:slug/view", incrementArticleViews);
router.get("/:slug/comments", getArticleComments);
router.post("/:slug/comments", createArticleComment);
router.get("/:slug", getArticleBySlug);
router.post("/", protect, requireAdmin, createArticle);
router.put("/:id", protect, requireAdmin, updateArticle);
router.delete("/:id", protect, requireAdmin, deleteArticle);

export default router;
