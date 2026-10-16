const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Database configuration error: MONGO_URI / MONGODB_URI is not set in environment.');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });

    cachedConnection = conn;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
