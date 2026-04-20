import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { ApiError } from "../utils/apiError";

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, "Route not found"));
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = err.message;
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    message = "Duplicate value detected";
  }

  if (err.message && statusCode === 500) {
    if (err.message.includes("Only image files are allowed")) {
      statusCode = 400;
    }
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};
