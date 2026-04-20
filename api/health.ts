// Health check endpoint for debugging Vercel deployment
export default async function handler(req: any, res: any) {
    try {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: {
                nodeEnv: process.env.NODE_ENV || 'not set',
                isVercel: !!process.env.VERCEL,
                hasMongoUri: !!process.env.MONGODB_URI,
                hasSessionSecret: !!process.env.SESSION_SECRET,
                hasGeminiKey: !!process.env.GEMINI_API_KEY,
                hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
                frontendUrl: process.env.FRONTEND_URL || 'not set',
            },
            message: 'MediLingo API is running'
        };

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(health);
    } catch (error: any) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
