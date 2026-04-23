import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

const signToken = (payload: Express.UserPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1d") as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, secret, {
    expiresIn
  });
};

export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!["admin", "superadmin", "subadmin"].includes(user.role)) {
    throw new ApiError(403, "Only admin or subadmin can access dashboard");
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
    username: user.username,
    email: user.email
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  });
});

export const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email and password are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(409, "User already exists with this email");
  }

  const user = await User.create({
    username,
    email,
    password,
    role: "admin"
  });

  res.status(201).json({
    success: true,
    message: "Admin registered",
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

export const createSubAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email and password are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(409, "User already exists with this email");
  }

  const user = await User.create({
    username,
    email,
    password,
    role: "subadmin"
  });

  res.status(201).json({
    success: true,
    message: "Subadmin created",
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Users fetched",
    data: users
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");
  const { role } = req.body as { role?: "admin" | "superadmin" | "subadmin" | "user" };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!role || !["admin", "superadmin", "subadmin", "user"].includes(role)) {
    throw new ApiError(400, "Role must be superadmin, admin, subadmin or user");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated",
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

export const resetSubAdminPassword = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");
  const { newPassword } = req.body as { newPassword?: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role !== "subadmin") {
    throw new ApiError(400, "Password reset is allowed only for subadmins");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Subadmin password updated"
  });
});

export const deleteSubAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role !== "subadmin") {
    throw new ApiError(400, "Only subadmin accounts can be deleted here");
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "Subadmin deleted"
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  });
});
