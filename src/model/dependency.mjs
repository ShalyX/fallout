import { readFile } from 'node:fs/promises';
import { chatJSON } from './nebius.mjs';

const systemPrompt = await readFile(new URL('../../prompts/dependency-system.txt', import.meta.url), 'utf8');

export async function classifyDependency({source, target}) {
  const schema = {
    relation: 'none | mention/reference | context | support_dependency | primary_support_dependency',
    confidence: 'number 0..1',
    source_span: 'exact supporting span or empty string',
    target_span: 'exact target rationale span or empty string',
    counterfactual: 'one sentence: what changes if source is invalid',
    independent_support: ['short descriptions of visible independent support'],
    reason: 'brief explanation'
  };
  return chatJSON({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `SOURCE ARTIFACT:\n${source}\n\nTARGET ARTIFACT:\n${target}\n\nReturn JSON with this shape:\n${JSON.stringify(schema, null, 2)}` }
    ]
  });
}
