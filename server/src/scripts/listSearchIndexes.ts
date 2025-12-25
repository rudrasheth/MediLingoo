import connectDB from '../config/db.ts';
import mongoose from 'mongoose';

(async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const coll = db.collection('medicalknowledges');
    const cursor = coll.aggregate([{ $listSearchIndexes: {} }]);
    const indexes = await cursor.toArray();
    console.log('Search indexes:', indexes.map((i: any) => ({ name: i.name, queryable: i.queryable })));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('List search indexes failed:', (err as any)?.message || err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
