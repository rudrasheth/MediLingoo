import app from '../server/src/vercel';

export default async function handler(req: any, res: any) {
    try {
        return app(req, res);
    } catch (error: any) {
        console.error('CRITICAL API ERROR:', error);
        res.status(500).json({
            success: false,
            message: `Server Error: ${error.message}`,
            details: error.message
        });
    }
}
