import { Router } from 'express';
import { updateHistory } from '../controllers/historyControllers';

const router = Router();

// This defines the POST /update route
router.post('/update', updateHistory);

export default router;