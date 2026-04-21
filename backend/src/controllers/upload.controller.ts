import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET;

const hasCloudinaryConfig =
  Boolean(cloudinaryCloudName) && Boolean(cloudinaryApiKey) && Boolean(cloudinaryApiSecret);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret
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
