# Stride Vault Order Dashboard

This upgrade adds a private dashboard at:

https://stride-vault.vercel.app/dashboard.html

It stores verified paid orders in Supabase and lets you change status:
Paid → Processing → Delivered / Cancelled.

## One-time setup

### A. Create the Supabase table
Open Supabase SQL Editor and run `supabase_schema.sql`.

### B. Add Vercel environment variables
In Vercel → Project → Settings → Environment Variables add:

SUPABASE_URL = your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY = your Supabase service-role key
ADMIN_PASSWORD = a strong private dashboard password
ADMIN_SESSION_SECRET = a long random secret (32+ characters)

Keep SUPABASE_SERVICE_ROLE_KEY and the two admin secrets private. Never put them in GitHub or the website.

### C. Redeploy
Push/commit the included files to the same GitHub repository so Vercel deploys them.

### D. Use the dashboard
Open /dashboard.html, enter ADMIN_PASSWORD, and you will see verified orders.

The payment flow saves an order only after the Vercel API verifies the Paystack transaction with PAYSTACK_SECRET_KEY.
