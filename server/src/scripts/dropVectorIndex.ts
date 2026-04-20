import connectDB from '../config/db.ts';
import mongoose from 'mongoose';

(async () => {
  const collectionName = 'medicalknowledges';
  const indexName = 'vector_index';

  try {
    await connectDB();
    const db = mongoose.connection.db;

    console.log(`Dropping search index '${indexName}' on collection '${collectionName}'...`);
    const res = await db.command({ dropSearchIndex: collectionName, name: indexName });
    console.log('Drop result:', res);

    console.log('Listing remaining search indexes...');
    try {
      const remaining = await db.collection(collectionName)
        .aggregate([{ $listSearchIndexes: {} }])
        .toArray();
      console.log('Remaining index names:', remaining.map((i: any) => i.name));
    } catch (listErr) {
      console.warn('Could not list search indexes via $listSearchIndexes:', (listErr as any)?.message);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to drop search index:', (err as any)?.message || err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
