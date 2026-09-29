import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

test('repository documents generate citizen pages', async () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'ignore' });
  const home = await readFile('dist/index.html', 'utf8');
  const life = await readFile('dist/life/index.html', 'utf8');
  const privacy = await readFile('dist/privacy/index.html', 'utf8');
  assert.match(home, /<meta name="viewport"/);
  assert.match(home, /id="proposal-form"/);
  assert.match(life, /実証で確かめること/);
  assert.match(privacy, /90日以内/);
});
