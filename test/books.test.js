// test/books.test.js
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { connectToDb, closeDb } from '../src/db/connect.js';
import { startTestServer, resetData, request, readSeed } from './helpers.js';

describe('Books API', () => {
  let server;

  before(async () => {
    server = await startTestServer();
  });
  beforeEach(resetData);
  after(async () => {
    await server.stop();
  });

  test('GET /books returns every book with only the spec fields', async () => {
    const response = await request(server.baseUrl, 'GET', '/books');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.deepEqual(response.body, readSeed('books'));
  });

  test('GET /books/:id returns one book or 404', async () => {
    const found = await request(server.baseUrl, 'GET', '/books/b1');
    assert.equal(found.status, 200);
    assert.equal(found.body.id, 'b1');
    assert.equal(found.body._id, undefined);

    const missing = await request(server.baseUrl, 'GET', '/books/zzz');
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.body, { message: 'Book not found' });
  });

  test('a database failure returns 500 with a safe message', async () => {
    await closeDb();
    try {
      const response = await request(server.baseUrl, 'GET', '/books');
      assert.equal(response.status, 500);
      assert.deepEqual(response.body, { message: 'Internal server error' });
    } finally {
      await connectToDb();
    }
  });
});
