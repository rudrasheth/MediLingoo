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
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req: any, res: any) {
    try {
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

        console.log('🔐 Login attempt started');
        console.log('📝 Environment check:', {
            hasMongoUri: !!process.env.MONGODB_URI,
            nodeEnv: process.env.NODE_ENV
        });
        
        // Connect to database
        await connectDB();
        console.log('✅ Database connected');

        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        console.log('🔍 Looking for user:', email);

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        console.log('👤 User found, checking password');

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        console.log('✅ Login successful');

        // Return success (without session for now)
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                age: user.age,
                gender: user.gender,
            },
        });
    } catch (error: any) {
        console.error('❌ Login error:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        return res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message,
            errorName: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
