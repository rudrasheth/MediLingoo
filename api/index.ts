export default async function handler(req: any, res: any) {
    try {
        // Dynamic import with error trapping
        // 'includeFiles' in vercel.json ensures this file exists in the bundle
        const appModule = await import('../server/src/index');
        const app = appModule.default;

        return app(req, res);
    } catch (error: any) {
        console.error('CRITICAL API STARTUP ERROR:', error);
        res.status(500).json({
            success: false,
            message: `Server Startup Failed: ${error.message}`,
            details: error.message
        });
    }
}
