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
    if (process.env.VERCEL && !cachedPromise) {
      cachedPromise = mongoose.connect(process.env.MONGODB_URI as string);
      await cachedPromise;
    } else if (!process.env.VERCEL) {
      // Local dev - just connect
      const conn = await mongoose.connect(process.env.MONGODB_URI as string);
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
      console.error(`❌ Error: ${error.message}`);
    }
    // In Vercel, throwing here crashes the function request, which matches the "Server Error" behavior user saw.
    // But now we catch it in middleware.
    throw error;
  }
};

export default connectDB;