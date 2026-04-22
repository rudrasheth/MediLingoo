export default async function handler(req: any, res: any) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    return res.status(200).json({
        success: true,
        message: 'Test login endpoint works!',
        body: req.body,
        method: req.method
    });
}
