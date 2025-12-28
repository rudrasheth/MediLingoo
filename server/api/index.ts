import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Dynamically import ESM app to avoid CJS require() issues
    const { app, initDB } = await import('../src/app.js');
    
    await initDB();
    return (app as any)(req as any, res as any);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
