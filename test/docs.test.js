// test/docs.test.js
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestServer } from './helpers.js';

const swagger = JSON.parse(readFileSync(new URL('../swagger.json', import.meta.url), 'utf8'));

describe('Swagger documentation', () => {
  let server;

  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.stop();
  });

  test('GET /api-docs/ serves the Swagger UI page', async () => {
    const response = await fetch(`${server.baseUrl}/api-docs/`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.match(await response.text(), /swagger/i);
  });

  test('the document uses a relative server so it works locally and on Render', () => {
    assert.deepEqual(swagger.servers.map((s) => s.url), ['/']);
  });

  test('every documented operation lists its responses', () => {
    for (const [path, operations] of Object.entries(swagger.paths)) {
      for (const [method, operation] of Object.entries(operations)) {
        assert.ok(Object.keys(operation.responses).length > 0, `${method.toUpperCase()} ${path}`);
        assert.ok(operation.responses['500'], `${method.toUpperCase()} ${path} documents 500`);
      }
    }
  });
});
