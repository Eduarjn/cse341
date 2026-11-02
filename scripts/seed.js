// scripts/seed.js
// Upserts the seed authors and books into the database from .env (npm run seed).
// Books from Week 01 are replaced by the Week 02 model: authorId instead of author.
import { readFileSync } from 'node:fs';
import { connectToDb, closeDb } from '../src/db/connect.js';

const readSeed = (name) => JSON.parse(readFileSync(new URL(`./${name}.seed.json`, import.meta.url), 'utf8'));

try {
  const db = await connectToDb();
  for (const name of ['authors', 'books']) {
    const documents = readSeed(name);
    for (const document of documents) {
      await db.collection(name).replaceOne({ id: document.id }, document, { upsert: true });
    }
    console.log(`[OK] ${name}: ${documents.map((document) => document.id).join(', ')}`);
  }
} catch (error) {
  console.error('[X] Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
