// src/db/connect.js
import { MongoClient } from 'mongodb';

let client;
let db;

const connectToDb = async () => {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Add it to your .env file or hosted environment settings.');
  }

  if (!dbName) {
    throw new Error('MONGODB_DB_NAME is not defined. Add it to your .env file or hosted environment settings.');
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  // ids are created by the API, so the database guarantees they stay unique
  await Promise.all([
    db.collection('books').createIndex({ id: 1 }, { unique: true }),
    db.collection('authors').createIndex({ id: 1 }, { unique: true }),
  ]);
  console.log(`Connected to MongoDB database: ${dbName}`);
  return db;
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb() before getDb().');
  }
  return db;
};

// Closes the connection (used by the automated tests)
const closeDb = async () => {
  if (client) {
    await client.close();
  }
  client = undefined;
  db = undefined;
};

export { connectToDb, getDb, closeDb };
