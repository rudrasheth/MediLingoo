import connectDB from '../config/db.ts';
import mongoose from 'mongoose';
import { MedicalKnowledge } from '../models/MedicalKnowledge.ts';

(async () => {
  try {
    await connectDB();

    const before = await MedicalKnowledge.estimatedDocumentCount();
    console.log(`Current documents in medicalknowledges: ${before}`);

    const result = await MedicalKnowledge.deleteMany({});
    console.log(`Deleted documents: ${result.deletedCount}`);

    const after = await MedicalKnowledge.estimatedDocumentCount();
    console.log(`Remaining documents in medicalknowledges: ${after}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Clear medical data failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
