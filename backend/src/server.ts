import dotenv from "dotenv";

import { connectDB } from "./config/db";
import User from "./models/User";
import app from "./app";

dotenv.config();

const port = Number(process.env.PORT ?? 5000);

const seedAdminIfMissing = async (): Promise<void> => {
  const email = process.env.ADMIN_SEED_EMAIL;
  const username = process.env.ADMIN_SEED_USERNAME ?? "admin";
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    let changed = false;

    if (existing.role !== "admin") {
      existing.role = "admin";
      changed = true;
    }

    if (existing.username !== username) {
      existing.username = username;
      changed = true;
    }

    // Keep seed credentials usable in development when account already exists.
    existing.password = password;
    changed = true;

    if (changed) {
      await existing.save();
      console.log(`Updated seeded admin user: ${email}`);
    }

    return;
  }

  await User.create({
    username,
    email,
    password,
    role: "admin"
  });

  console.log(`Seeded admin user: ${email}`);
};

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await seedAdminIfMissing();

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    console.error(
      "Deployment hint: verify Render env vars (MONGODB_URI, JWT_SECRET, CORS_ORIGIN) and allow Render IPs in MongoDB Atlas Network Access."
    );
    process.exit(1);
  }
};

void startServer();
