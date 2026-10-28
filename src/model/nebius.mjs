const DEFAULT_BASE_URL = 'https://api.tokenfactory.nebius.com/v1';
const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b';

export async function chatJSON({messages, model = DEFAULT_MODEL, maxTokens = 1400, temperature = 0}) {
  const apiKey = process.env.NEBIUS_API_KEY;
  if (!apiKey) throw new Error('NEBIUS_API_KEY is not set');
  const baseUrl = process.env.NEBIUS_BASE_URL || DEFAULT_BASE_URL;
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Nebius ${response.status}: ${text.slice(0, 500)}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Nebius response had no message content');
  return { json: JSON.parse(content), meta: { model: data.model || model, usage: data.usage || null, id: data.id || null } };
}
