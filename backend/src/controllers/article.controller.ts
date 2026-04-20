import { Request, Response } from "express";
import mongoose from "mongoose";

import Article from "../models/Article";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { generateUniqueSlug } from "../utils/slug";

export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, category, image, author } = req.body as {
    title?: string;
    content?: string;
    category?: string;
    image?: string;
    author?: string;
  };

  if (!title || !content || !category) {
    throw new ApiError(400, "Title, content and category are required");
  }

  const slug = await generateUniqueSlug(title);
  const normalizedAuthor = author?.trim();

  const article = await Article.create({
    title,
    slug,
    content,
    category,
    image,
    author: normalizedAuthor || req.user?.username || "Admin"
  });

  res.status(201).json({
    success: true,
    message: "Article created",
    data: article
  });
});

export const getAllArticles = asyncHandler(async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;

  const filter = category ? { category } : {};
  const articles = await Article.find(filter).sort({ createdAt: -1 });

  const categories = [...new Set(articles.map((article) => article.category))];

  res.status(200).json({
    success: true,
    message: "Articles fetched",
    data: {
      articles,
      categories
    }
  });
});

export const getArticleBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = String(req.params.slug ?? "");
  const article = await Article.findOne({ slug });

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  res.status(200).json({
    success: true,
    message: "Article fetched",
    data: article
  });
});

export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid article id");
  }

  const { title, content, category, image, author } = req.body as {
    title?: string;
    content?: string;
    category?: string;
    image?: string;
    author?: string;
  };

  const article = await Article.findById(id);
  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (title && title !== article.title) {
    article.slug = await generateUniqueSlug(title, article._id.toString());
    article.title = title;
  }

  if (content !== undefined) {
    article.content = content;
  }

  if (category !== undefined) {
    article.category = category;
  }

  if (image !== undefined) {
    article.image = image;
  }

  if (author !== undefined) {
    const normalizedAuthor = author.trim();
    article.author = normalizedAuthor || req.user?.username || article.author;
  }

  await article.save();

  res.status(200).json({
    success: true,
    message: "Article updated",
    data: article
  });
});

export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid article id");
  }

  const article = await Article.findByIdAndDelete(id);
  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  res.status(200).json({
    success: true,
    message: "Article deleted"
  });
});
