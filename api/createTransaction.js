import midtransClient from "midtrans-client"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order, amount, name } = req.body;

  try {
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY_SANDBOX,
    });

    const parameter = {
      transaction_details: {
        order_id: order,
        gross_amount: amount,
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: name,
      },
    };

    const transaction = await snap.createTransaction(parameter).then((transaction) => {
      let transactionToken = transaction.token;
      console.log('transactionToken:', transactionToken);
    });
    res.status(200).json({ token: transaction.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}