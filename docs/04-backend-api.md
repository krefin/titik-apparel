# 04. Backend REST API Reference

[🏠 Home Utama](../README.md) \| [📚 Docs Hub](./README.md) \| [⬅️ Kembali: 03. Setup & Instalasi](./03-setup-and-installation.md) \| [Lanjut: 05. Panduan Frontend ➡️](./05-frontend-guide.md)

---

## 🔐 Header Autentikasi API

Untuk endpoint privat yang membutuhkan autentikasi, sertakan salah satu dari:
1. **HTTP-Only Cookie**: `token=<jwt_token>` (tersimpan otomatis saat login)
2. **Authorization Header**: `Authorization: Bearer <jwt_token>`

---

## 🔑 1. Autentikasi API (`/api/auth`)

### `POST /api/auth/register`
- **Rate Limit**: 15 request / 15 menit
- **Akses**: Publik
- **Body Request**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password123",
    "telephone": "081234567890",
    "address": "Jl. Merdeka No. 45",
    "city": "Jakarta Selatan",
    "postalCode": "12110"
  }
  ```
- **Respons (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registrasi berhasil",
    "data": {
      "user": { "id": 1, "name": "Budi Santoso", "email": "budi@example.com", "role": "customer" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### `POST /api/auth/login`
- **Rate Limit**: 15 request / 15 menit
- **Akses**: Publik
- **Body Request**: `{ "email": "budi@example.com", "password": "password123" }`
- **Respons (200 OK)**: Menyimpan HTTP-Only Cookie `token` & mengembalikan profil pengguna.

### `POST /api/auth/logout`
- **Akses**: Publik
- **Respons (200 OK)**: Menghapus cookie `token`.

### `GET /api/auth/me`
- **Akses**: Pengguna Terautentikasi
- **Respons (200 OK)**: Mengembalikan objek profil pengguna saat ini.

---

## 📦 2. Produk API (`/api/products`)

### `GET /api/products`
- **Akses**: Publik
- **Query Params**: `search`, `category`, `sort`, `page`, `limit`
- **Respons (200 OK)**: Array produk terpaginasi.

### `GET /api/products/:id`
- **Akses**: Publik
- **Respons (200 OK)**: Objek detail produk tunggal.

### `POST /api/products`
- **Akses**: Admin Sahaja (`authMiddleware`, `isAdmin`)
- **Body Request**:
  ```json
  {
    "name": "Kaos Titik Oversize White",
    "price": 149000,
    "stock": 50,
    "description": "Heavyweight cotton 24s premium t-shirt",
    "image": "/uploads/product-1.jpg"
  }
  ```
- **Respons (201 Created)**: Objek produk baru + memicu socket event `stock_update`.

### `PUT /api/products/:id`
- **Akses**: Admin Sahaja

### `DELETE /api/products/:id`
- **Akses**: Admin Sahaja

---

## 🛒 3. Keranjang Belanja API (`/api/cart`)

### `GET /api/cart`
- **Akses**: Pengguna Terautentikasi

### `POST /api/cart`
- **Akses**: Pengguna Terautentikasi
- **Body Request**: `{ "productId": 1, "quantity": 2 }`
- **Respons (200 OK)**: Memicu socket event `cart_update`.

### `PUT /api/cart/:itemId`
- **Akses**: Pengguna Terautentikasi

### `DELETE /api/cart/:itemId`
- **Akses**: Pengguna Terautentikasi

### `DELETE /api/cart`
- **Akses**: Pengguna Terautentikasi (Mengosongkan seluruh keranjang).

---

## 📝 4. Pesanan API (`/api/orders`)

### `POST /api/orders`
- **Akses**: Pengguna Terautentikasi
- **Body Request**:
  ```json
  {
    "items": [
      { "productId": 1, "quantity": 2, "price": 149000, "name": "Kaos Titik Oversize White" }
    ],
    "courier": "jne",
    "paymentMethod": "midtrans",
    "recipientName": "Budi Santoso",
    "telephone": "081234567890",
    "address": "Jl. Merdeka No. 45",
    "city": "Jakarta Selatan",
    "postalCode": "12110",
    "notes": "Tolong dipacking rapi"
  }
  ```
- **Respons (201 Created)**: Mengurangi stok produk & mengirim `new_order_notification` ke admin via WebSocket.

### `GET /api/orders`
- **Akses**: Pengguna Terautentikasi (Mengembalikan daftar pesanan milik pengguna).

### `GET /api/orders/all`
- **Akses**: Admin Sahaja (Mengembalikan seluruh pesanan dengan pencarian & filter).

### `GET /api/orders/:id`
- **Akses**: Pemilik Pesanan ATAU Admin.

### `PUT /api/orders/:id/status`
- **Akses**: Admin Sahaja
- **Body Request**: `{ "status": "completed" }`
- **Opsi Status**: `pending`, `paid`, `process`, `processing`, `shipped`, `shipping`, `completed`, `done`, `canceled`, `cancelled`, `failed`.
- **Respons (200 OK)**: Mengirim event WebSocket `order_status_update` ke pengguna. Stok otomatis dipulihkan jika status diubah ke `cancelled`/`failed`.

---

## 💳 5. Pembayaran API (`/api/payment`)

### `POST /api/payment/token`
- **Akses**: Pengguna Terautentikasi
- **Body Request**: `{ "orderId": 12 }`
- **Respons (200 OK)**: Mengembalikan `token` Snap Midtrans.

### `POST /api/payment/notification`
- **Akses**: Webhook Midtrans (Diverifikasi Signature SHA512) / User Fallback.
- **Respons (200 OK)**: Mengubah status pesanan ke `paid` atau `failed` setelah verifikasi hash SHA512 & pencocokan jumlah pembayaran (`gross_amount`).

---

## 📱 6. DANA Webhook API (`/v1.0/debit/notify`)

### `POST /v1.0/debit/notify`
- **Akses**: Webhook DANA Gateway (Body bertipe `application/json` RAW Buffer)
- **Proses**: Diverifikasi menggunakan `DANA_PUBLIC_KEY` via `dana-node/webhook/v1` `WebhookParser`.
- **Respons (200 OK)**: `{ "responseCode": "2005600", "responseMessage": "Success" }`

---

## 📈 7. Statistik Admin API (`/api/admin/stats`)

### `GET /api/admin/stats`
- **Akses**: Admin Sahaja
- **Respons (200 OK)**: Mengembalikan total pendapatan, jumlah pesanan, total produk, total pengguna, dan feeds pesanan terbaru.

---

[⬅️ Kembali: 03. Setup & Instalasi](./03-setup-and-installation.md) \| [📚 Docs Hub](./README.md) \| [Lanjut: 05. Panduan Frontend ➡️](./05-frontend-guide.md)
