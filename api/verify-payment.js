export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const reference = req.query.reference;

  if (!reference) {
    return res.status(400).json({
      error: "Payment reference is required"
    });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        verified: false,
        error: data.message || "Unable to verify payment"
      });
    }

    const transaction = data.data;

    return res.status(200).json({
      verified: transaction.status === "success",
      status: transaction.status,
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency
    });

  } catch (error) {
    return res.status(500).json({
      verified: false,
      error: "Payment verification failed"
    });
  }
}
