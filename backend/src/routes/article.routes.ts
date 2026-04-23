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
import { protect, requireEditor } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllArticles);
router.post("/:slug/view", incrementArticleViews);
router.get("/:slug/comments", getArticleComments);
router.post("/:slug/comments", createArticleComment);
router.get("/:slug", getArticleBySlug);
router.post("/", protect, requireEditor, createArticle);
router.put("/:id", protect, requireEditor, updateArticle);
router.delete("/:id", protect, requireEditor, deleteArticle);

export default router;
