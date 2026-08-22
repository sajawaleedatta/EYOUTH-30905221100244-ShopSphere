import mongoose from "mongoose";

const connectMongoDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) {
    console.error("MONGODB_URI environment variable is required");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Review Service: MongoDB connected");
  } catch (error) {
    console.error("Review Service: MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectMongoDB;
