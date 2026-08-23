import { isAdmin } from "./_auth.js";

export default async function handler(req, res) {
  if (!isAdmin(req)) {
    return res.status(401).json({
      ok: false,
      error: "Unauthorized"
    });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(500).json({
      ok: false,
      error: "Supabase environment variables are missing."
    });
  }

  try {
    if (req.method === "GET") {
      const response = await fetch(
        `${url}/rest/v1/orders?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          ok: false,
          error: data.message || "Failed to load orders."
        });
      }

      return res.status(200).json({
        ok: true,
        orders: data
      });
    }

    if (req.method === "PATCH") {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};

      if (!body.id || !body.status) {
        return res.status(400).json({
          ok: false,
          error: "Order ID and status are required."
        });
      }

      const response = await fetch(
        `${url}/rest/v1/orders?id=eq.${encodeURIComponent(body.id)}`,
        {
          method: "PATCH",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            status: body.status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          ok: false,
          error: data.message || "Failed to update order."
        });
      }

      return res.status(200).json({
        ok: true,
        order: data[0] || null
      });
    }

    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Server error."
    });
  }
          }
