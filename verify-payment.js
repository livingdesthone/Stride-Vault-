export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ verified: false, error: "Method not allowed" });

  const reference = String(req.query?.reference || "");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ verified: false, error: "PAYSTACK_SECRET_KEY is missing." });
  if (!reference) return res.status(400).json({ verified: false, error: "Payment reference is required." });

  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const data = await r.json();

    if (!r.ok || !data.status || !data.data) {
      return res.status(400).json({ verified: false, error: data?.message || "Paystack verification failed." });
    }

    const tx = data.data;
    return res.status(200).json({
      verified: tx.status === "success",
      status: tx.status,
      amount: tx.amount,
      currency: tx.currency,
      reference: tx.reference,
      paid_at: tx.paid_at || null
    });
  } catch (e) {
    console.error("verify-payment error", e);
    return res.status(500).json({ verified: false, error: "Payment verification server error." });
  }
}
