import mongoose from 'mongoose';

export default async function handler(req: any, res: any) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Just test mongoose connection
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            return res.status(500).json({
                success: false,
                error: 'MONGODB_URI not set'
            });
        }
        
        // Try to connect
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(mongoUri);
        }
        
        return res.status(200).json({
            success: true,
            message: 'Mongoose connection works!',
            connectionState: mongoose.connection.readyState
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
