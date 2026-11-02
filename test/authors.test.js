// test/authors.test.js
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { connectToDb, closeDb } from '../src/db/connect.js';
import { startTestServer, resetData, request, readSeed } from './helpers.js';

describe('Authors API', () => {
  let server;
  const call = (method, path, body) => request(server.baseUrl, method, path, body);

  before(async () => {
    server = await startTestServer();
  });
  beforeEach(resetData);
  after(async () => {
    await server.stop();
  });

  test('GET /authors returns every author sorted by id', async () => {
    const response = await call('GET', '/authors');
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, readSeed('authors'));
  });

  test('GET /authors/:id returns one author or 404', async () => {
    const found = await call('GET', '/authors/a1');
    assert.equal(found.status, 200);
    assert.deepEqual(found.body, { id: 'a1', name: 'Maya Rivera', nationality: 'American' });

    const missing = await call('GET', '/authors/zzz');
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.body, { message: 'Author not found' });
  });

  test('POST /authors creates an author with the next id', async () => {
    const response = await call('POST', '/authors', { id: 'x9', name: '  Chimamanda Ngozi Adichie ', nationality: 'Nigerian', extra: 1 });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('location'), '/authors/a4');
    assert.deepEqual(response.body, { id: 'a4', name: 'Chimamanda Ngozi Adichie', nationality: 'Nigerian' });

    const saved = await call('GET', '/authors/a4');
    assert.deepEqual(saved.body, response.body);
  });

  test('POST /authors rejects invalid bodies with 400', async () => {
    const noName = await call('POST', '/authors', { nationality: 'Brazilian' });
    assert.equal(noName.status, 400);
    assert.deepEqual(noName.body, { message: 'Validation failed', errors: ['name is required'] });

    const tooLong = await call('POST', '/authors', { name: 'x'.repeat(101), nationality: 7 });
    assert.equal(tooLong.status, 400);
    assert.deepEqual(tooLong.body.errors, ['name must be at most 100 characters', 'nationality must be a string']);

    const notJson = await call('POST', '/authors', '{"name": ');
    assert.equal(notJson.status, 400);
    assert.deepEqual(notJson.body, { message: 'Invalid JSON body' });

    const array = await call('POST', '/authors', [{ name: 'A' }]);
    assert.equal(array.status, 400);
    assert.deepEqual(array.body.errors, ['request body must be a JSON object']);
  });

  test('PUT /authors/:id replaces the author, keeps the id and returns 200', async () => {
    const response = await call('PUT', '/authors/a1', { id: 'a99', name: 'Maya Rivera' });
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { id: 'a1', name: 'Maya Rivera' }); // full update: nationality removed

    const missing = await call('PUT', '/authors/zzz', { name: 'Nobody' });
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.body, { message: 'Author not found' });

    const invalid = await call('PUT', '/authors/a1', { name: '' });
    assert.equal(invalid.status, 400);
  });

  test('DELETE /authors/:id returns 204, then 404', async () => {
    const created = await call('POST', '/authors', { name: 'Temporary Author' });
    const deleted = await call('DELETE', `/authors/${created.body.id}`);
    assert.equal(deleted.status, 204);
    assert.equal(deleted.body, null);

    const again = await call('DELETE', `/authors/${created.body.id}`);
    assert.equal(again.status, 404);
  });

  test('a database failure returns 500 with a safe message', async () => {
    await closeDb();
    try {
      const response = await call('POST', '/authors', { name: 'Anyone' });
      assert.equal(response.status, 500);
      assert.deepEqual(response.body, { message: 'Internal server error' });
    } finally {
      await connectToDb();
    }
  });
});
