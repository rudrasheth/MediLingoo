import app from '../server/src/index';

export default async function handler(req: any, res: any) {
    try {
        // Forward to Express App
        return app(req, res);
    } catch (error: any) {
        console.error('CRITICAL API ERROR:', error);
        res.status(500).json({
            error: 'Critical Server Error',
            details: error.message
        });
    }
}
