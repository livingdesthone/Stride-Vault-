Fix: Paystack checkout now collects delivery details before the receipt email.
The previous dashboard build referenced delivery details before defining them, which
stopped the checkout after the email prompt. This version fixes that flow.

Flow:
1. Cart
2. Customer name / phone / delivery location / landmark
3. Receipt email
4. Paystack
5. Server verification
6. Save verified order to dashboard
7. WhatsApp confirmation
