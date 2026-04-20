import app from '../server/src/vercel';

export default async function handler(req: any, res: any) {
    try {
        // Set CORS headers explicitly for Vercel
        const origin = req.headers.origin || req.headers.referer;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(200).end();
        }

        // Ensure response is JSON
        res.setHeader('Content-Type', 'application/json');
        
        return app(req, res);
    } catch (error: any) {
        console.error('CRITICAL API ERROR:', error);
        console.error('Error stack:', error.stack);
        
        // Always return JSON, never HTML
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
