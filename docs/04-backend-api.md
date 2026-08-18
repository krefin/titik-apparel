# 04. Backend REST API Reference

[Back to Documentation Index](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/README.md)

---

## 🔐 Authentication Headers

For authenticated endpoints, send either:
1. **HTTP-Only Cookie**: `token=<jwt_token>` (set automatically upon login)
2. **Bearer Header**: `Authorization: Bearer <jwt_token>`

---

## 🔑 1. Authentication API (`/api/auth`)

### `POST /api/auth/register`
- **Rate Limit**: 15 requests / 15 mins
- **Auth**: Public
- **Request Body**:
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
- **Response (201 Created)**:
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
- **Rate Limit**: 15 requests / 15 mins
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "budi@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**: Sets HTTP-Only Cookie `token` & returns user object.

### `POST /api/auth/logout`
- **Auth**: Public
- **Response (200 OK)**: Clears cookie `token`.

### `GET /api/auth/me`
- **Auth**: Authenticated User
- **Response (200 OK)**: Returns current user profile object.

---

## 📦 2. Product API (`/api/products`)

### `GET /api/products`
- **Auth**: Public
- **Query Params**: `search`, `category`, `sort`, `page`, `limit`
- **Response (200 OK)**: Paginated array of products.

### `GET /api/products/:id`
- **Auth**: Public
- **Response (200 OK)**: Single product details object.

### `POST /api/products`
- **Auth**: Admin Only (`authMiddleware`, `isAdmin`)
- **Request Body**:
  ```json
  {
    "name": "Kaos Titik Oversize White",
    "price": 149000,
    "stock": 50,
    "description": "Heavyweight cotton 24s premium t-shirt",
    "image": "/uploads/product-1.jpg"
  }
  ```
- **Response (201 Created)**: Created product object. Emits `stock_update` socket event.

### `PUT /api/products/:id`
- **Auth**: Admin Only
- **Response (200 OK)**: Updated product object.

### `DELETE /api/products/:id`
- **Auth**: Admin Only
- **Response (200 OK)**: `{ "success": true, "message": "Product deleted" }`

---

## 🛒 3. Cart API (`/api/cart`)

### `GET /api/cart`
- **Auth**: Authenticated User
- **Response (200 OK)**: Active cart object with items list.

### `POST /api/cart`
- **Auth**: Authenticated User
- **Request Body**: `{ "productId": 1, "quantity": 2 }`
- **Response (200 OK)**: Updated cart object. Emits `cart_update` socket event.

### `PUT /api/cart/:itemId`
- **Auth**: Authenticated User
- **Request Body**: `{ "quantity": 3 }`

### `DELETE /api/cart/:itemId`
- **Auth**: Authenticated User

### `DELETE /api/cart`
- **Auth**: Authenticated User (Clears entire cart).

---

## 📝 4. Order API (`/api/orders`)

### `POST /api/orders`
- **Auth**: Authenticated User
- **Request Body**:
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
- **Response (201 Created)**: Order object created. Decrements product stock & emits `new_order_notification` to admin socket.

### `GET /api/orders`
- **Auth**: Authenticated User (Returns user's own orders).

### `GET /api/orders/all`
- **Auth**: Admin Only (Returns all orders with pagination & search).

### `GET /api/orders/:id`
- **Auth**: Order Owner OR Admin Only.

### `PUT /api/orders/:id/status`
- **Auth**: Admin Only
- **Request Body**: `{ "status": "completed" }`
- **Allowed Statuses**: `pending`, `paid`, `process`, `processing`, `shipped`, `shipping`, `completed`, `done`, `canceled`, `cancelled`, `failed`.
- **Response (200 OK)**: Status updated. Emits `order_status_update` socket event to the customer. Restores stock automatically if status transitions into `cancelled`/`failed`.

---

## 💳 5. Payment API (`/api/payment`)

### `POST /api/payment/token`
- **Auth**: Authenticated User
- **Request Body**: `{ "orderId": 12 }`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "SNAP_TOKEN_STRING_FROM_MIDTRANS",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
  }
  ```

### `POST /api/payment/notification`
- **Auth**: Midtrans Webhook (Signature SHA512 verified) OR Order Owner Fallback.
- **Request Body**: Midtrans HTTP Notification Webhook Payload.
- **Response (200 OK)**: Updates order status to `paid` or `failed` upon SHA512 signature & gross amount verification.

---

## 📈 6. Admin Analytics API (`/api/admin/stats`)

### `GET /api/admin/stats`
- **Auth**: Admin Only
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalRevenue": 15450000,
      "totalOrders": 34,
      "totalProducts": 18,
      "totalUsers": 120,
      "recentOrders": [...]
    }
  }
  ```

---

[Next: Frontend Architecture Guide ➡️](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/05-frontend-guide.md)
