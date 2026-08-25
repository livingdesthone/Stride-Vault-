import { isAdmin } from "./_auth.js";
import { supabaseRequest } from "./_supabase.js";

export default async function handler(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized"
      });
    }

    if (req.method === "GET") {
      const rows = await supabaseRequest(
        "orders?select=*&order=created_at.desc"
      );

      return res.status(200).json({
        ok: true,
        orders: Array.isArray(rows) ? rows : []
      });
    }

    if (req.method === "PATCH") {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};

      const id = String(body.id || "");
      const status = String(body.status || "");

      const allowed = new Set([
        "Paid",
        "Processing",
        "Delivered",
        "Cancelled"
      ]);

      if (!id || !allowed.has(status)) {
        return res.status(400).json({
          ok: false,
          error: "Invalid order id or status."
        });
      }

      const rows = await supabaseRequest(
        `orders?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            Prefer: "return=representation"
          },
          body: JSON.stringify({ status })
        }
      );

      return res.status(200).json({
        ok: true,
        order: Array.isArray(rows) ? rows[0] || null : rows
      });
    }

    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });

  } catch (e) {
    console.error("ORDERS API ERROR:", e);

    return res.status(500).json({
      ok: false,
      error: e.message || "Could not load orders."
    });
  }
}
