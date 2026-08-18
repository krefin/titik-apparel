# 06. Arsitektur Keamanan & Best Practices

[🏠 Home Utama](../README.md) \| [📚 Docs Hub](./README.md) \| [⬅️ Kembali: 05. Panduan Frontend](./05-frontend-guide.md) \| [Lanjut: 07. Production & Operasional ➡️](./07-deployment-and-operations.md)

---

## 🛡️ Ringkasan Arsitektur Keamanan

Titik Apparel menerapkan prinsip **Defense-in-Depth** di seluruh lapisan aplikasi untuk melindungi data pengguna, mencegah akses tanpa izin, dan mengamankan transaksi bisnis.

---

## 🔒 1. Content Security Policy & HTTP Headers (`next.config.ts`)

Berkas `next.config.ts` menegaskan header keamanan HTTP yang ketat pada setiap respon:

- `poweredByHeader: false`: Menghapus header `X-Powered-By: Next.js` untuk menyembunyikan identitas teknologi server.
- `X-Frame-Options: DENY`: Mencegah *Clickjacking* dengan melarang embedding `iframe`.
- `X-Content-Type-Options: nosniff`: Mencegah kerentanan *MIME-sniffing*.
- `Strict-Transport-Security (HSTS)`: Memaksa koneksi HTTPS (`max-age=63072000; includeSubDomains; preload`).
- `Referrer-Policy: strict-origin-when-cross-origin`: Membatasi kebocoran referrer.
- `Permissions-Policy`: Mematikan API perangkat keras browser yang tidak dipakai (kamera, mikrofon, geolokasi).
- `Content-Security-Policy (CSP)`: Membatasi eksekusi script, gaya, font, gambar, dan WebSocket hanya dari domain terpercaya (*Self, Midtrans, DANA, Unsplash, WebSocket Localhost*).

---

## 🛡️ 2. Penguatan Server Express (`backend/src/app.js`)

- **Helmet Middleware**: Mengunci header keamanan server-side (`frameguard`, `noSniff`, `xssFilter`, `hidePoweredBy`, `hsts`).
- **Proteksi Payload Limit**: Membatasi JSON & URL-encoded body maksimal `10mb` untuk mencegah serangan *Large Payload DoS*.
- **Kontrol CORS Ketat**: Mengunci akses cross-origin hanya ke `env.clientOrigin` dengan `credentials: true`.
- **Rate Limiting (`express-rate-limit`)**:
  - Global API Limiter: `300 request / 15 menit` per IP.
  - Auth Limiter: `15 request / 15 menit` pada `/api/auth/login` dan `/api/auth/register` untuk mencegah serangan *brute-force*.
  - Upload Limiter: `20 upload / 15 menit` pada endpoint unggah gambar.

---

## 🔑 3. Autentikasi & Otorisasi

- **HTTP-Only Cookies**: Token JWT dikirim melalui cookie `httpOnly: true`, `secure: true` (saat produksi), dan `sameSite: 'lax'` untuk mencegah pencurian token via Cross-Site Scripting (XSS).
- **Role-Based Access Control (RBAC)**: Rute privat memverifikasi `req.user.role === 'admin'` melalui `isAdmin` middleware.
- **Verifikasi Kepemilikan Data (Proteksi BOLA / IDOR)**:
  - Pengguna hanya dapat membaca/mengubah keranjang, profil, dan pesanan milik sendiri (`order.userId === req.user.id`).
  - Pengguna biasa tidak dapat menaikkan hak akses (misal: `role: "admin"` otomatis dihapus saat update profil).

---

## 💳 4. Integritas Pembayaran & Anti-Price Tampering

- **Verifikasi Signature SHA512 (Midtrans)**: Webhook Midtrans diverifikasi terhadap hash `sha512(order_id + status_code + gross_amount + ServerKey)`.
- **Verifikasi Signature DANA**: Webhook DANA diverifikasi menggunakan `WebhookParser` berbasis kunci publik RSA.
- **Pencocokan Jumlah Tagihan**: Backend memeriksa `paidAmount === order.grandTotal`. Ketidakcocokan harga akan melempar `400 Bad Request`.

---

## 🧪 5. Pengujian & Kualitas Kode (Testing)

- **Automated Tests Backend**: 7 Test Suites / 52 Test Cases mencakup Auth, User, Order, Cart, Product, Payment, dan Admin Stats (`npm test`).
- **Frontend Type Safety**: Konfigurasi TypeScript ketat (`npm run typecheck`) tanpa tipe `any` implisit.

---

[⬅️ Kembali: 05. Panduan Frontend](./05-frontend-guide.md) \| [📚 Docs Hub](./README.md) \| [Lanjut: 07. Production & Operasional ➡️](./07-deployment-and-operations.md)
