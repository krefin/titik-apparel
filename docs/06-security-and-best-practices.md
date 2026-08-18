# 06. Security Architecture & Best Practices

[Back to Documentation Index](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/README.md)

---

## 🛡️ Security Implementation Overview

Titik Apparel follows a **Defense-in-Depth** security design across all application layers to safeguard user data, prevent unauthorized access, and protect business transactions.

---

## 🔒 1. Content Security Policy & HTTP Headers (`next.config.ts`)

Next.js `next.config.ts` enforces strict HTTP security headers on all responses:

- `poweredByHeader: false`: Removes `X-Powered-By: Next.js` header to obscure server identity.
- `X-Frame-Options: DENY`: Prevents Clickjacking by disallowing `iframe` embedding.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing vulnerabilities.
- `Strict-Transport-Security (HSTS)`: Enforces HTTPS connections (`max-age=63072000; includeSubDomains; preload`).
- `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer leaks.
- `Permissions-Policy`: Disables unused browser hardware APIs (camera, microphone, geolocation).
- `Content-Security-Policy (CSP)`: Restricts script, style, font, image, and WebSocket connections to whitelist trusted domains (*Self, Midtrans, Unsplash, WebSocket Localhost*).

---

## 🛡️ 2. Express Server Hardening (`backend/src/app.js`)

- **Helmet Middleware**: Enforces server-side security headers (`frameguard`, `noSniff`, `xssFilter`, `hidePoweredBy`, `hsts`).
- **Payload Limit Protection**: Restricts JSON & URL-encoded request bodies to `10mb` to mitigate Large Payload Denial of Service (DoS) attacks.
- **Strict CORS Control**: Restricts cross-origin resource sharing strictly to `env.clientOrigin` with `credentials: true`.
- **Rate Limiting (`express-rate-limit`)**:
  - Global API Limiter: `300 requests / 15 mins` per IP.
  - Auth Limiter: `15 requests / 15 mins` on `/api/auth/login` and `/api/auth/register` to prevent brute-force attacks.
  - Upload Limiter: `20 uploads / 15 mins` on image upload endpoints.

---

## 🔑 3. Authentication & Authorization

- **HTTP-Only Cookies**: JWT tokens are transmitted via `httpOnly: true`, `secure: true` (in production), and `sameSite: 'lax'` cookies to mitigate Cross-Site Scripting (XSS) token theft.
- **Role-Based Access Control (RBAC)**: Protected routes verify `req.user.role === 'admin'` via `isAdmin` middleware.
- **Data Ownership Verification (BOLA / IDOR Defense)**:
  - Users can only read/update their own cart, profile, and orders (`order.userId === req.user.id`).
  - Non-admin users cannot elevate privileges (e.g. `role: "admin"` is stripped on profile update).

---

## 💳 4. Payment Integrity & Anti-Price Tampering

- **SHA512 Webhook Signature Verification**: Incoming Midtrans HTTP notifications are verified against `crypto.createHash('sha512').update(order_id + status_code + gross_amount + ServerKey)`.
- **Gross Amount Matching**: The backend checks `paidAmount === order.grandTotal`. Any price mismatch throws a `400 Bad Request` and halts order processing.

---

## 🧪 5. Testing & Code Quality Assurance

- **Backend Automated Tests**: 7 Test Suites / 52 Tests covering Auth, User, Order, Cart, Product, Payment, and Admin Stats (`npm test`).
- **Frontend Type Safety**: Strict TypeScript configuration (`npm run typecheck`) with zero implicit `any` types.

---

[Next: Deployment & Operations Guide ➡️](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/07-deployment-and-operations.md)
