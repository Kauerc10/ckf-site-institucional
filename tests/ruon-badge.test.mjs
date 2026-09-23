import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('index.html inclui carregamento assíncrono do Web Component ruon-badge', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.ok(indexHtml.includes('src="https://ruon.dev/badge.js"'));
  assert.ok(indexHtml.includes('async'));
});

test('App.jsx renderiza o custom element ruon-badge no rodapé com referência ckf-site', () => {
  const appJsx = fs.readFileSync(path.resolve('src/App.jsx'), 'utf8');
  assert.ok(appJsx.includes('<ruon-badge'));
  assert.ok(appJsx.includes('project="ckf-site"'));
  assert.ok(appJsx.includes('theme="dark"'));
  assert.ok(appJsx.includes('size="sm"'));
});

test('App.jsx não mantém crédito de estúdio legado no rodapé', () => {
  const appJsx = fs.readFileSync(path.resolve('src/App.jsx'), 'utf8');
  assert.ok(!appJsx.includes('K-Hub'));
});
