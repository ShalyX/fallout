import { classifyDependency } from '../src/model/dependency.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  if (!process.env.NEBIUS_API_KEY) return res.status(503).json({ error: 'Nebius credentials are not configured' });
  const { source, target } = req.body || {};
  if (!source || !target) return res.status(400).json({ error: 'source and target are required' });
  try {
    const result = await classifyDependency({ source, target });
    res.status(200).json(result);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
}
