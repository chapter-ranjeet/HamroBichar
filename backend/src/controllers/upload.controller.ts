import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const uploadBufferToCloudinary = (buffer: Buffer, originalName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const folder = process.env.CLOUDINARY_FOLDER || "hamrobichar";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: `${Date.now()}-${originalName.replace(/\s+/g, "-").toLowerCase()}`
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloud upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  const fallbackFileName = req.file.filename || `${Date.now()}-${req.file.originalname}`;
  let imagePath = `/uploads/${fallbackFileName}`;

  if (hasCloudinaryConfig && req.file.buffer) {
    imagePath = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
  }

  res.status(201).json({
    success: true,
    message: "Image uploaded",
    data: {
      imageUrl: imagePath
    }
  });
});
