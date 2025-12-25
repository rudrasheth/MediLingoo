import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI!, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('No database connection');

    // Check medicalknowledges collection
    const count = await db.collection('medicalknowledges').countDocuments();
    console.log(`\nTotal records in medicalknowledges: ${count}`);

    // Sample one record to verify vector dimensions
    const sample = await db.collection('medicalknowledges').findOne();
    if (sample) {
      console.log(`\nSample disease: ${sample.disease}`);
      console.log(`Vector length: ${sample.healthSummaryVector?.length || 0}`);
      console.log(`Symptoms: ${sample.symptoms?.join(', ')}`);
      console.log(`Remedy: ${sample.remedy?.substring(0, 100)}...`);
    }

    // List all diseases
    const diseases = await db
      .collection('medicalknowledges')
      .find({})
      .project({ disease: 1 })
      .toArray();

    console.log(`\n📋 All diseases in database (${diseases.length}):`);
    diseases.forEach((doc, idx) => {
      console.log(`  ${idx + 1}. ${doc.disease}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', (error as any)?.message);
    process.exit(1);
  }
}

checkData();
