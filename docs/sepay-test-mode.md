# SePay Test Mode

SePay is enabled only while `NODE_ENV=development`. It uses a simulated Test Mode account and cannot receive money from a real banking application.

1. In SePay, switch to **Test mode** and create a new bank account. Do not copy a Live account.
2. Put the simulated bank gateway name, account number, account name and HMAC secret in `.env.local`. Set `SEPAY_TEST_MODE=true` and use a public HTTPS tunnel in `SEPAY_PUBLIC_BASE_URL`.
3. Create a JSON webhook at `{SEPAY_PUBLIC_BASE_URL}/api/payments/sepay/webhook`; select **Tiền vào**, enable retries, choose the Test Mode account and HMAC-SHA256. Configure payment-code prefix `NEM`.
4. Run `npm run sepay:test:check`, then create an order with **Chuyển khoản QR (SePay thử nghiệm)**.
5. In SePay Test Mode, use **Mô phỏng tạo mã VietQR** or **Mô phỏng giao dịch** with the exact amount and the order's `NEM...` payment code. The verified webhook changes the order to PAID/CONFIRMED.

Never add Live credentials or a real bank account to this integration.

Sources: [webhook authentication](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc), [webhook payload](https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook), [Test Mode QR simulation](https://developer.sepay.vn/vi/tien-ich-khac/test-mode/mo-phong-tao-ma-vietqr).
