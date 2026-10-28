export default function handler(_req, res) {
  res.status(200).json({
    provider: 'Nebius Token Factory',
    model: 'nvidia/nemotron-3-super-120b-a12b',
    configured: Boolean(process.env.NEBIUS_API_KEY)
  });
}
