import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MedicalKnowledge } from '../models/MedicalKnowledge';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

async function importUniqueCSV(csvFilePath: string) {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connected to MongoDB');

  const uniqueDiseases = new Map<string, any>();
  let totalRows = 0;

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          totalRows++;
          const disease = row['Disease Prediction'] || row.Disease || row.disease || '';

          // Skip if already have this disease
          if (uniqueDiseases.has(disease)) {
            return;
          }

          // Extract vector columns (vector_0 to vector_383)
          const vector: number[] = [];
          for (let i = 0; i < 384; i++) {
            const val = parseFloat(row[`vector_${i}`]);
            if (!isNaN(val)) {
              vector.push(val);
            }
          }

          // Only process if we have a complete 384-D vector
          if (vector.length === 384) {
            const record = {
              disease: disease,
              symptoms: row['Symptoms/Question'] ? row['Symptoms/Question'].split(',').map((s: string) => s.trim()) : [],
              remedy: row['Recommended Medicines'] || row.Recommend || row.Advice || row.remedy || '',
              precautions: row.Advice ? row.Advice.split(',').map((p: string) => p.trim()) : [],
              severity: row.Severity_Score || row.Severity_S || row.severity || '',
              healthSummaryVector: vector,
              text_to_embed: row.text_to_embed || ''
            };

            uniqueDiseases.set(disease, record);
            console.log(`Found unique disease #${uniqueDiseases.size}: ${disease}`);
          }
        } catch (error) {
          console.error('Error processing row:', error);
        }
      })
      .on('end', async () => {
        console.log(`\nTotal rows in CSV: ${totalRows}`);
        console.log(`Unique diseases found: ${uniqueDiseases.size}`);
        
        const records = Array.from(uniqueDiseases.values());
        
        try {
          const result = await MedicalKnowledge.insertMany(records, { ordered: false });
          console.log(`✅ Inserted ${result.length} unique disease records`);
        } catch (error) {
          console.error('Insert error:', (error as any)?.message);
        }

        console.log(`\n✅ Import complete! Total unique records: ${uniqueDiseases.size}`);
        await mongoose.disconnect();
        resolve();
      })
      .on('error', (error) => {
        console.error('CSV read error:', error);
        reject(error);
      });
  });
}

// Usage: npx tsx ./src/scripts/importUniqueDiseasesOnly.ts <path-to-csv>
const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: npx tsx ./src/scripts/importUniqueDiseasesOnly.ts <csv-file-path>');
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`File not found: ${csvPath}`);
  process.exit(1);
}

importUniqueCSV(csvPath).catch(async (err) => {
  console.error('Import failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
