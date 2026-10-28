import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { propagateInvalidation } from '../src/core/propagate.mjs';

const graph = JSON.parse(await readFile(new URL('../fixtures/fallout_demo.json', import.meta.url)));

test('invalidating E17 produces a differentiated blast radius', () => {
  const result = propagateInvalidation(graph, 'E17', 'instrumentation bug');
  const byId = Object.fromEntries(result.nodes.map((n) => [n.id, n]));

  assert.equal(byId.E17.status, 'invalidated');
  assert.equal(byId.C1.status, 'unsupported');
  assert.equal(byId.D1.status, 'unsupported');
  assert.equal(byId.D2.status, 'needs_review');
  assert.equal(byId.A1.status, 'needs_review');
  assert.equal(byId.D3.status, 'supported');
});

test('independent evidence preserves partial support', () => {
  const result = propagateInvalidation(graph, 'E17');
  const d2 = result.nodes.find((n) => n.id === 'D2');
  assert.ok(d2.impact.remainingSupport > 0.6);
  assert.ok(d2.impact.surviving.some((s) => s.from === 'C2'));
  assert.equal(d2.status, 'needs_review');
});

test('a downstream item can be affected but remain supported', () => {
  const result = propagateInvalidation(graph, 'E17');
  const d3 = result.nodes.find((n) => n.id === 'D3');
  assert.equal(d3.status, 'supported');
  assert.ok(d3.impact.supportLossRatio < 0.30);
  assert.equal(result.impacted.some((n) => n.id === 'D3'), true);
});

test('unrelated evidence remains unchanged', () => {
  const result = propagateInvalidation(graph, 'E17');
  const e19 = result.nodes.find((n) => n.id === 'E19');
  assert.equal(e19.status, 'valid');
  assert.equal(result.impacted.some((n) => n.id === 'E19'), false);
});
