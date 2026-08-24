# Stride Vault — Order Dashboard Fix

## What was fixed

The previous build had `dashboard.html` calling `/api/orders`, but `api/orders.js` was missing. It also referenced `/api/create-order` and `/api/verify-payment`, which were missing from the ZIP.

This build includes all three routes:

- `/api/orders` — protected dashboard GET/PATCH endpoint
- `/api/verify-payment` — server-side Paystack verification
- `/api/create-order` — verifies the payment again and saves the order to Supabase

Dashboard URL:

`https://stride-vault.vercel.app/dashboard.html`

## Supabase

Run `supabase_schema.sql` in the Supabase SQL Editor.

## Vercel environment variables

Add these in Vercel → Project → Settings → Environment Variables:

- `PAYSTACK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Use the same production values for the Production environment.

Never put `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, or `ADMIN_SESSION_SECRET` inside `index.html` or GitHub.

## Deploy

Upload/commit the contents of this ZIP to the GitHub repository connected to Vercel, then redeploy.

After deployment:

1. Open `/dashboard.html`.
2. Enter the value from `ADMIN_PASSWORD`.
3. The dashboard should load the orders from Supabase.
4. Test a small real Paystack payment only after confirming the environment variables are present.

## Expected flow

Cart → delivery details → Paystack → `/api/verify-payment` → `/api/create-order` → Supabase → `/dashboard.html` → `/api/orders`.

The server verifies the Paystack transaction again before saving, so a browser cannot simply mark an unpaid order as Paid.
