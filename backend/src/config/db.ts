import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed. Check MONGODB_URI and Atlas network access.");
    throw error;
  }
};
