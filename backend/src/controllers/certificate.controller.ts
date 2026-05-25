import { Request, Response } from "express";
import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import Certificate from "../models/Certificate";

const normalizeCertificateId = (value?: string): string => (value ?? "").trim().toUpperCase();

const toCertificatePayload = (certificate: {
  _id: unknown;
  certificateId: string;
  name: string;
  age: number;
  designation: string;
  role?: string;
  issueDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: certificate._id,
  certificateId: certificate.certificateId,
  name: certificate.name,
  age: certificate.age,
  designation: certificate.designation,
  role: certificate.role,
  issueDate: certificate.issueDate,
  expiryDate: certificate.expiryDate,
  createdAt: certificate.createdAt,
  updatedAt: certificate.updatedAt
});

export const createCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { certificateId, name, age, designation, role, issueDate, expiryDate } = req.body as {
    certificateId?: string;
    name?: string;
    age?: number | string;
    designation?: string;
    role?: string;
    issueDate?: string;
    expiryDate?: string;
  };

  const normalizedCertificateId = normalizeCertificateId(certificateId);

  if (!normalizedCertificateId || !name || age === undefined || !designation || !issueDate) {
    throw new ApiError(400, "Certificate ID, name, age, designation and issue date are required");
  }

  const numericAge = Number(age);
  if (Number.isNaN(numericAge) || numericAge < 0) {
    throw new ApiError(400, "Age must be a valid non-negative number");
  }

  const parsedIssueDate = new Date(issueDate);
  if (Number.isNaN(parsedIssueDate.getTime())) {
    throw new ApiError(400, "Issue date must be a valid date");
  }

  const parsedExpiryDate = expiryDate ? new Date(expiryDate) : undefined;
  if (expiryDate && parsedExpiryDate && Number.isNaN(parsedExpiryDate.getTime())) {
    throw new ApiError(400, "Expiry date must be a valid date");
  }

  const exists = await Certificate.findOne({ certificateId: normalizedCertificateId });
  if (exists) {
    throw new ApiError(409, "Certificate ID already exists");
  }

  const certificate = await Certificate.create({
    certificateId: normalizedCertificateId,
    name: name.trim(),
    age: numericAge,
    designation: designation.trim(),
    role: role?.trim(),
    issueDate: parsedIssueDate,
    expiryDate: parsedExpiryDate,
    createdBy: req.user?.userId && mongoose.Types.ObjectId.isValid(req.user.userId) ? req.user.userId : undefined
  });

  res.status(201).json({
    success: true,
    message: "Certificate created",
    data: toCertificatePayload(certificate)
  });
});

export const listCertificates = asyncHandler(async (_req: Request, res: Response) => {
  const certificates = await Certificate.find().sort({ createdAt: -1 }).limit(50);

  res.status(200).json({
    success: true,
    message: "Certificates fetched",
    data: certificates.map(toCertificatePayload)
  });
});

export const getCertificateById = asyncHandler(async (req: Request, res: Response) => {
  const certificateId = normalizeCertificateId(String(req.params.certificateId ?? ""));

  if (!certificateId) {
    throw new ApiError(400, "Certificate ID is required");
  }

  const certificate = await Certificate.findOne({ certificateId });
  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  res.status(200).json({
    success: true,
    message: "Certificate verified",
    data: toCertificatePayload(certificate)
  });
});

export const deleteCertificate = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid certificate id");
  }

  const certificate = await Certificate.findById(id);
  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  await certificate.deleteOne();

  res.status(200).json({
    success: true,
    message: "Certificate deleted"
  });
});