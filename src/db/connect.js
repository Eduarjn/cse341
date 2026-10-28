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
  console.log(`Connected to MongoDB database: ${dbName}`);
  return db;
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb() before getDb().');
  }
  return db;
};

export { connectToDb, getDb };
