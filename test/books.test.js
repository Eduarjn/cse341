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

  const call = (method, path, body) => request(server.baseUrl, method, path, body);
  const newBook = { title: '  The Lighthouse Keeper ', authorId: 'a1', publicationDate: '2024-05-10' };

  test('POST /books creates a book with the next id and a Location header', async () => {
    const response = await call('POST', '/books', { ...newBook, id: 'x1', author: 'ignored' });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('location'), '/books/b4');
    assert.deepEqual(response.body, { id: 'b4', title: 'The Lighthouse Keeper', authorId: 'a1', publicationDate: '2024-05-10' });

    const saved = await call('GET', '/books/b4');
    assert.deepEqual(saved.body, response.body);
  });

  test('POST /books rejects invalid fields and an unknown author with 400', async () => {
    const empty = await call('POST', '/books', {});
    assert.equal(empty.status, 400);
    assert.deepEqual(empty.body.errors, ['title is required', 'authorId is required', 'publicationDate is required']);

    const badDates = await call('POST', '/books', { ...newBook, publicationDate: '2021-02-30' });
    assert.deepEqual(badDates.body.errors, ['publicationDate must be a real calendar date']);
    const badFormat = await call('POST', '/books', { ...newBook, publicationDate: '10/05/2024' });
    assert.deepEqual(badFormat.body.errors, ['publicationDate must be a date in YYYY-MM-DD format']);

    const unknownAuthor = await call('POST', '/books', { ...newBook, authorId: 'zzz' });
    assert.equal(unknownAuthor.status, 400);
    assert.deepEqual(unknownAuthor.body, { message: 'Validation failed', errors: ['authorId does not match an existing author'] });

    const all = await call('GET', '/books');
    assert.equal(all.body.length, 3); // nothing was saved
  });

  test('PUT /books/:id replaces the book and keeps the id', async () => {
    const response = await call('PUT', '/books/b1', { title: 'Patterns of Light (2nd edition)', authorId: 'a2', publicationDate: '2022-01-10' });
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { id: 'b1', title: 'Patterns of Light (2nd edition)', authorId: 'a2', publicationDate: '2022-01-10' });

    const missing = await call('PUT', '/books/zzz', newBook);
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.body, { message: 'Book not found' });

    const unknownAuthor = await call('PUT', '/books/b1', { ...newBook, authorId: 'zzz' });
    assert.equal(unknownAuthor.status, 400);
  });

  test('DELETE /books/:id returns 204, then 404', async () => {
    const deleted = await call('DELETE', '/books/b3');
    assert.equal(deleted.status, 204);
    assert.equal(deleted.body, null);

    const again = await call('DELETE', '/books/b3');
    assert.equal(again.status, 404);
    assert.deepEqual(again.body, { message: 'Book not found' });
  });

  test('ids keep growing after the highest one and lists sort by number', async () => {
    await call('DELETE', '/books/b2');
    const created = [];
    for (let i = 0; i < 8; i += 1) {
      created.push((await call('POST', '/books', newBook)).body.id);
    }
    assert.deepEqual(created, ['b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11']);
    const ids = (await call('GET', '/books')).body.map((book) => book.id);
    assert.deepEqual(ids, ['b1', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11']);
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
