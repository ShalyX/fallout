import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { atlasGraph } from '../src/data/atlas.mjs';
import { propagateInvalidation } from '../src/core/propagate.mjs';

test('the exact graph used by the UI produces the promised four-item business blast radius', () => {
  const result = propagateInvalidation(atlasGraph, 'E17', 'Android instrumentation bug');
  const business = result.impacted.filter((node) => ['decision', 'artifact'].includes(node.type));
  const statuses = Object.fromEntries(business.map((node) => [node.id, node.status]));
  assert.deepEqual(statuses, {
    D1: 'unsupported',
    D2: 'needs_review',
    A1: 'needs_review',
    D3: 'supported'
  });
});

test('every displayed node excerpt exists verbatim in its committed source artifact', async () => {
  for (const node of atlasGraph.nodes) {
    const text = await readFile(new URL(`../artifacts/${node.source.file}`, import.meta.url), 'utf8');
    assert.ok(text.includes(node.source.excerpt), `${node.id} excerpt is not grounded in ${node.source.file}`);
  }
});

test('every verified dependency edge is grounded by verbatim spans in both source artifacts', async () => {
  const nodes = Object.fromEntries(atlasGraph.nodes.map((node) => [node.id, node]));
  for (const edge of atlasGraph.edges.filter((edge) => edge.verified)) {
    const sourceText = await readFile(new URL(`../artifacts/${nodes[edge.from].source.file}`, import.meta.url), 'utf8');
    const targetText = await readFile(new URL(`../artifacts/${nodes[edge.to].source.file}`, import.meta.url), 'utf8');
    assert.ok(sourceText.includes(edge.sourceSpan), `${edge.id} source span is not verbatim`);
    assert.ok(targetText.includes(edge.targetSpan), `${edge.id} target span is not verbatim`);
    assert.ok(edge.counterfactual.length > 20, `${edge.id} counterfactual is missing`);
  }
});
