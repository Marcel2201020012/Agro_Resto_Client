import midtransClient from "midtrans-client"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, name, email } = req.body;

  try {
    // Inisialisasi Midtrans Snap
    let snap = new midtransClient.Snap({
      isProduction: false, // Sandbox dulu
      serverKey: process.env.MIDTRANS_SERVER_KEY_SANDBOX,
    });

    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: amount,
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: name,
        email: email,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.status(200).json({ token: transaction.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}