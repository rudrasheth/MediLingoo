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
        console.log('📝 Signup attempt started');
        
        // Connect to database
        await connectDB();
        console.log('✅ Database connected');

        const { name, email, password, age, gender } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        console.log('🔍 Checking if user exists:', email);

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        console.log('🔐 Hashing password');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('💾 Creating user');

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            age,
            gender,
        });

        console.log('✅ Signup successful');

        // Return success
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                age: user.age,
                gender: user.gender,
            },
        });
    } catch (error: any) {
        console.error('❌ Signup error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during signup',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
