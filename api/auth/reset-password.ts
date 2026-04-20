import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Database connection
async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI not set');
    }
    
    await mongoose.connect(mongoUri);
}

// User model inline
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: Number,
    gender: String,
    otpCode: String,
    otpExpires: Date,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req: any, res: any) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        console.log('🔄 Reset password request started');
        
        // Connect to database
        await connectDB();
        console.log('✅ Database connected');

        const { email, otp, newPassword } = req.body;

        // Validation
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required',
            });
        }

        // Password validation
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long',
            });
        }

        console.log('🔍 Looking for user:', email);

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or OTP',
            });
        }

        console.log('👤 User found, verifying OTP');

        // Check if OTP exists
        if (!user.otpCode || !user.otpExpires) {
            return res.status(401).json({
                success: false,
                message: 'No OTP request found. Please request a new one.',
            });
        }

        // Verify OTP
        if (user.otpCode !== otp) {
            return res.status(401).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        // Check OTP expiration
        const currentTime = new Date();
        if (currentTime > user.otpExpires) {
            return res.status(401).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        console.log('🔐 OTP verified, updating password');

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        console.log('✅ Password reset successful');

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please login with your new password.',
        });
    } catch (error: any) {
        console.error('❌ Reset password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
