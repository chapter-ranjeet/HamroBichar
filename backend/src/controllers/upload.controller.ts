import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  const imagePath = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "Image uploaded",
    data: {
      imageUrl: imagePath
    }
  });
});
