export default async function handler(req: any, res: any) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
        success: true,
        message: 'Test endpoint working',
        method: req.method,
        url: req.url
    });
}
