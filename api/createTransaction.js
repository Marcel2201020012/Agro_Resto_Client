import midtransClient from "midtrans-client"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order, amount, name, items, tableId } = req.body;
  const item_details = items.map(item => ({
    price: item.price,
    quantity: item.jumlah,
    name: item.name,
  }));

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
      item_details: item_details,
      callback: {
        finish: `https://agro-resto-client.vercel.app/confirm?orderId=${order}&tableId=${tableId}`,
        unfinish: `https://agro-resto-client.vercel.app/confirm?orderId=${order}&tableId=${tableId}`,
        error: `https://agro-resto-client.vercel.app/confirm?orderId=${order}&tableId=${tableId}`,
      }
    };

    const transaction = await snap.createTransaction(parameter);
    res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}