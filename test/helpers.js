// test/helpers.js
// Starts the API against a real MongoDB that runs in memory, so the tests never touch Atlas.
import { readFileSync } from 'node:fs';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import app from '../app.js';
import { connectToDb, getDb, closeDb } from '../src/db/connect.js';

const readSeed = (name) => JSON.parse(readFileSync(new URL(`../scripts/${name}.seed.json`, import.meta.url), 'utf8'));

const startTestServer = async () => {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DB_NAME = 'cse341-books-test';
  await connectToDb();

  const server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const stop = async () => {
    await new Promise((resolve) => server.close(resolve));
    await closeDb();
    await mongo.stop();
  };
  return { baseUrl, stop };
};

// Puts the seed files back in the database before each test
const resetData = async () => {
  const db = getDb();
  for (const name of ['books', 'authors']) {
    let documents;
    try {
      documents = readSeed(name);
    } catch {
      continue; // collection not created yet
    }
    await db.collection(name).deleteMany({});
    await db.collection(name).insertMany(documents.map((document) => ({ ...document })));
  }
};

// fetch with a JSON body; returns { status, headers, body }
const request = async (baseUrl, method, path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await response.text();
  return { status: response.status, headers: response.headers, body: text ? JSON.parse(text) : null };
};

export { startTestServer, resetData, request, readSeed };
