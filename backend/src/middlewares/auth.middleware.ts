import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/apiError";

export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized: token missing"));
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new ApiError(500, "JWT secret is not configured"));
  }

  try {
    const payload = jwt.verify(token, secret) as Express.UserPayload;
    req.user = payload;
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Unauthorized: invalid token"));
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError(403, "Forbidden: admin access required"));
  }

  return next();
};
