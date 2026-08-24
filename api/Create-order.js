import { supabaseRequest } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ ok: false, error: "PAYSTACK_SECRET_KEY is missing." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const reference = String(body.reference || "");
    const customer = body.customer || {};
    const items = Array.isArray(body.items) ? body.items : [];

    if (!reference || !customer.name || !customer.phone || !customer.location || !items.length) {
      return res.status(400).json({ ok: false, error: "Missing order details." });
    }

    // Verify directly with Paystack on the server before writing anything to the dashboard.
    const vr = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const vd = await vr.json();
    if (!vr.ok || !vd.status || vd?.data?.status !== "success") {
      return res.status(400).json({ ok: false, error: "Payment is not verified." });
    }

    const tx = vd.data;
    if (tx.currency !== "GHS") return res.status(400).json({ ok: false, error: "Payment currency is not GHS." });

    const total = items.reduce((sum, item) => {
      const price = Number(item.price);
      const qty = Number(item.qty);
      return sum + (Number.isFinite(price) && Number.isFinite(qty) ? price * qty : 0);
    }, 0);

    if (Math.round(total * 100) !== Number(tx.amount)) {
      return res.status(400).json({ ok: false, error: "Payment amount does not match the order." });
    }

    const row = {
      reference: tx.reference,
      customer_name: String(customer.name),
      customer_phone: String(customer.phone),
      delivery_location: String(customer.location),
      landmark: String(customer.landmark || ""),
      items,
      total_amount: total,
      status: "Paid",
      paystack_paid_at: tx.paid_at || null
    };

    // The unique reference constraint makes retries safe.
    const saved = await supabaseRequest("orders", {
      method: "POST",
      headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
      body: JSON.stringify(row)
    });

    return res.status(200).json({ ok: true, order: Array.isArray(saved) ? saved[0] || null : saved });
  } catch (e) {
    console.error("create-order error", e);
    return res.status(500).json({ ok: false, error: e.message || "Could not save order." });
  }
    }
