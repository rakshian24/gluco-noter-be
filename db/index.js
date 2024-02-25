import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { NODE_ENV, MONGO_URI_PROD, MONGO_URI_DEV } = process.env;
    const isProduction = NODE_ENV === "production";
    const mongoUri = isProduction ? MONGO_URI_PROD : MONGO_URI_DEV;
    const conn = await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
