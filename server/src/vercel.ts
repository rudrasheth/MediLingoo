import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
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
import { SESSION_SECRET, NODE_ENV, FRONTEND_URL } from './config/env';

const app: Application = express();

// Middleware - Cookie Parser
app.use(cookieParser());

// Middleware - CORS
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [FRONTEND_URL];
        if (!origin) return callback(null, true);
        if (allowed.includes(origin)) return callback(null, true);
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        callback(null, false);
    },
    credentials: true,
}));

// Middleware - Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware - Sessions
app.use(session({
    secret: SESSION_SECRET || 'medilingo_vercel_fallback',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
    },
    name: 'medilingo_session',
}));

// Middleware - Ensure DB Connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error
        });
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

// Health Check
app.get('/', (req, res) => {
    res.send('MediLingo Vercel API is running...');
});

// JSON Error Handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error('❌ Vercel App Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        details: err.message
    });
});

export default app;
