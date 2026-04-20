import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

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

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Generate OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

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
        console.log('🔑 Forgot password request started');
        
        // Connect to database
        await connectDB();
        console.log('✅ Database connected');

        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        console.log('🔍 Looking for user:', email);

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if email exists for security
            return res.status(200).json({
                success: true,
                message: 'If this email is registered, you will receive an OTP shortly',
            });
        }

        console.log('👤 User found, generating OTP');

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP valid for 10 minutes

        // Save OTP to database
        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        console.log('📧 Sending OTP email');

        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'MediLingo - Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
                        <p style="color: #666; margin-bottom: 20px;">
                            We received a request to reset your MediLingo account password. 
                            Use the OTP code below to proceed with the password reset.
                        </p>
                        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; margin: 0;">Your OTP Code:</p>
                            <p style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 5px; margin: 10px 0;">
                                ${otp}
                            </p>
                        </div>
                        <p style="color: #999; font-size: 14px; margin: 20px 0;">
                            ⏱️ This OTP is valid for <strong>10 minutes</strong> only.
                        </p>
                        <p style="color: #999; font-size: 14px; margin: 20px 0;">
                            If you didn't request a password reset, please ignore this email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            © 2025 MediLingo. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent successfully');

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Valid for 10 minutes.',
        });
    } catch (error: any) {
        console.error('❌ Forgot password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing forgot password request',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
