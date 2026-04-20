import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Cached connection for Vercel/Serverless
let cachedPromise: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
  if (process.env.VERCEL) {
    if (mongoose.connection.readyState === 1) {
      // console.log('✅ MongoDB already connected (cached)');
      return;
    }

    if (mongoose.connection.readyState === 2 && cachedPromise) {
      await cachedPromise;
      return;
    }
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    if (process.env.VERCEL && !cachedPromise) {
      console.log('🔄 Connecting to MongoDB (Vercel)...');
      cachedPromise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      await cachedPromise;
      console.log('✅ MongoDB connected successfully');
    } else if (!process.env.VERCEL) {
      // Local dev - just connect
      console.log('🔄 Connecting to MongoDB (Local)...');
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    }

    // Listen for MongoDB connection events
    if (mongoose.connection.listenerCount('error') === 0) {
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
    // In Vercel, throwing here crashes the function request, which matches the "Server Error" behavior user saw.
    // But now we catch it in middleware.
    throw error;
  }
};

export default connectDB;