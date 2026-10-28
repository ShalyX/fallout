import { readFile } from 'node:fs/promises';
import { classifyDependency } from '../src/model/dependency.mjs';

if (!process.env.NEBIUS_API_KEY) {
  console.error('BLOCKED: NEBIUS_API_KEY is not set. Deterministic propagation is proven; live dependency-quality evaluation remains open.');
  process.exit(2);
}

const cases = JSON.parse(await readFile(new URL('../evals/edge_cases.json', import.meta.url)));
const dependencyRelations = new Set(['support_dependency', 'primary_support_dependency']);
let correct = 0;
const results = [];

function exactSpanPresent(text, span) {
  return typeof span === 'string' && span.length > 0 && text.includes(span);
}

for (const c of cases) {
  const out = await classifyDependency(c);
  const actual = out.json.relation;
  const relationPass = actual === c.expected;
  const requiresGrounding = dependencyRelations.has(actual);
  const groundingPass = !requiresGrounding || (
    exactSpanPresent(c.source, out.json.source_span) &&
    exactSpanPresent(c.target, out.json.target_span)
  );
  const counterfactualPass = !requiresGrounding || (typeof out.json.counterfactual === 'string' && out.json.counterfactual.trim().length >= 12);
  const confidencePass = typeof out.json.confidence === 'number' && out.json.confidence >= 0 && out.json.confidence <= 1;
  const pass = relationPass && groundingPass && counterfactualPass && confidencePass;
  if (pass) correct++;

  const result = {
    id: c.id,
    expected: c.expected,
    actual,
    pass,
    checks: { relationPass, groundingPass, counterfactualPass, confidencePass },
    confidence: out.json.confidence,
    source_span: out.json.source_span,
    target_span: out.json.target_span,
    model: out.meta.model,
    usage: out.meta.usage
  };
  results.push(result);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${c.id}: expected=${c.expected} actual=${actual} grounding=${groundingPass}`);
}

const score = correct / cases.length;
console.log(JSON.stringify({ score, correct, total: cases.length, results }, null, 2));
process.exit(score >= 0.875 ? 0 : 1);
