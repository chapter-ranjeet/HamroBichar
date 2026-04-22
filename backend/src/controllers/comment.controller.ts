import { Request, Response } from "express";

import Article from "../models/Article";
import Comment from "../models/Comment";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const getArticleComments = asyncHandler(async (req: Request, res: Response) => {
  const slug = String(req.params.slug ?? "");
  const comments = await Comment.find({ articleSlug: slug }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Comments fetched",
    data: comments
  });
});

export const createArticleComment = asyncHandler(async (req: Request, res: Response) => {
  const slug = String(req.params.slug ?? "");
  const { name, message } = req.body as { name?: string; message?: string };

  if (!name?.trim() || !message?.trim()) {
    throw new ApiError(400, "Name and message are required");
  }

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  const comment = await Comment.create({
    articleSlug: slug,
    name: name.trim(),
    message: message.trim()
  });

  res.status(201).json({
    success: true,
    message: "Comment posted",
    data: comment
  });
});
