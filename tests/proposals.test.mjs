import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/proposals.js';

const good = { municipality: '倉敷市', category: '暮らし・政策', title: '近居支援の対象を調べる', detail: '近居支援の対象世帯数と財政影響を調べ、試験的に実施したいです。', token: 'valid-token' };
const request = (body) => new Request('https://example.com/api/proposals', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const db = () => {
  const rows = [];
  return { rows, prepare(sql) { assert.match(sql, /^INSERT INTO proposals/); return { bind(...values) { return { async run() { rows.push(values); } }; } }; } };
};
const env = (database) => ({ DB: database, TURNSTILE_SECRET: 'secret' });

test('valid proposal is stored privately as pending', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => Response.json({ success: true });
  const database = db();
  const response = await onRequestPost({ request: request(good), env: env(database) });
  assert.equal(response.status, 202);
  assert.equal(database.rows.length, 1);
  assert.equal(database.rows[0][5], 'pending');
  assert.equal(database.rows[0][4], good.detail);
  const receipt = await response.json();
  assert.equal(receipt.status, 'pending');
  assert.equal(Object.hasOwn(receipt, 'detail'), false);
});

test('invalid Turnstile token is rejected without storage', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => Response.json({ success: false });
  const database = db();
  const response = await onRequestPost({ request: request(good), env: env(database) });
  assert.equal(response.status, 400);
  assert.equal(database.rows.length, 0);
});

test('invalid input is rejected before verification', async () => {
  const database = db();
  const response = await onRequestPost({ request: request({ ...good, detail: '短い' }), env: env(database) });
  assert.equal(response.status, 400);
  assert.equal(database.rows.length, 0);
});

test('missing private bindings disable reception', async () => {
  const response = await onRequestPost({ request: request(good), env: {} });
  assert.equal(response.status, 503);
});
