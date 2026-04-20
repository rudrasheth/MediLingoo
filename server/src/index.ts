import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/db';
import prescriptionRoutes from './routes/prescriptionRoutes';
import voiceRoutes from './routes/voiceRoutes';
import authRoutes from './routes/authRoutes';
import paymentRoutes from './routes/paymentRoutes';
import chatRoutes from './routes/chatRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import doctorRoutes from './routes/doctorRoutes';
import shareRoutes from './routes/shareRoutes';
import cycleRoutes from './routes/cycleRoutes';
import { SESSION_SECRET, NODE_ENV, FRONTEND_URL, PORT } from './config/env';
import { TrackingService } from './services/trackingService';

// Initialize configuration
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.io with CORS (Wrapped to prevent startup crash on Vercel)
let io: any;
try {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST']
    },
    // Optimize for 5-second GPS updates
    pingTimeout: 60000,
    pingInterval: 25000,
    // Buffering settings for burst updates
    transports: ['websocket', 'polling'],
  });
} catch (e) {
  console.warn('⚠️ Socket.io initialization failed/skipped:', e);
}

// Middleware - Cookie Parser
app.use(cookieParser());

// Middleware - CORS (configured for frontend)
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [FRONTEND_URL];

    // Allow requests with no origin (like mobile apps or server-to-server)
    if (!origin) return callback(null, true);

    // Allow specific origins
    if (allowed.includes(origin)) return callback(null, true);

    // Allow localhost (Development)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);

    // Allow Vercel deployments (Production/Preview)
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    console.log('❌ CSS Blocked Origin:', origin);
    callback(null, false); // Block others
  },
  credentials: true, // Allow cookies
}));

// Middleware - Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware - Sessions
app.use(session({
  secret: SESSION_SECRET || 'medilingo_default_secret_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent JavaScript from accessing the cookie
    sameSite: 'lax', // allow cross-site POSTs from frontend dev server
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
  name: 'medilingo_session', // Custom session cookie name
}));

// Serve static files (for driver simulator)
app.use(express.static('public'));

// Middleware - Ensure DB Connection (Critical for Serverless/Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed in middleware:', error);
    res.status(500).json({ error: 'Database connection error' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/cycle', cycleRoutes);

// Basic Health Check Route
app.get('/', (req: Request, res: Response) => {
  res.send('MediLingo API is running...');
});

// Global Express Error Handler (Prevents HTML responses for API errors)
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('❌ Express Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start server function (Only runs locally or in non-serverless environments)
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Vehicle Tracking Service (Only if io is available)
    if (io) {
      const trackingService = new TrackingService(io);
      console.log('🚗 Vehicle tracking service initialized');

      // Add tracking stats endpoint
      app.get('/api/tracking/stats', (req: Request, res: Response) => {
        res.json(trackingService.getStats());
      });
    } else {
      console.warn('⚠️ Vehicle tracking service skipped (No Socket.io)');
      app.get('/api/tracking/stats', (req: Request, res: Response) => {
        res.json({ error: 'Tracking service unavailable' });
      });
    }

    // Start server
    const server = httpServer.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 API available at http://0.0.0.0:${PORT}`);
      console.log(`🔌 WebSocket server ready for vehicle tracking`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Export app for Vercel deployment
export default app;

// Only start the server if NOT running in Vercel (Vercel handles the server start)
if (!process.env.VERCEL) {
  startServer();
}
