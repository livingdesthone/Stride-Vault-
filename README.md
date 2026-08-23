Stride Vault — verified Paystack checkout.

The frontend uses the Paystack public key only. The Paystack secret key remains in Vercel as PAYSTACK_SECRET_KEY. After checkout, the site calls https://stride-vault.vercel.app/api/verify-payment and checks success, GHS currency, and the paid amount before WhatsApp confirmation. Never put the Paystack secret key in GitHub or chat.
