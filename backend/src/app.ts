import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";

import { errorHandler, notFound } from "./middlewares/error.middleware";
import articleRoutes from "./routes/article.routes";
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";

dotenv.config();

const app = express();
const uploadsDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "https://hamrobichar.com",
  "https://www.hamrobichar.com",
  "https://hamrobichar.app",
  "https://www.hamrobichar.app"
];

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins,
    ...(process.env.CORS_ORIGIN ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
