import midtransClient from 'midtrans-client';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId } = req.query;
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

  try {
    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY_SANDBOX,
    });

    const status = await core.transaction.status(orderId);
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}