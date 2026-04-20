import { Request, Response } from 'express';
import { MedicalHistory } from '../models/MedicalHistory';

export const updateHistory = async (req: Request, res: Response) => {
  try {
    const { userId, chronicConditions, activeMedications } = req.body;

    // This logic finds the history for the user and updates it, or creates it if it doesn't exist
    const history = await MedicalHistory.findOneAndUpdate(
      { userId },
      { 
        $addToSet: { chronicConditions: { $each: chronicConditions } },
        $push: { activeMedications: { $each: activeMedications } },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};