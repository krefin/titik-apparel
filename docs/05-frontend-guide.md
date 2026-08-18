# 05. Frontend Architecture & UI/UX Guide

[Back to Documentation Index](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/README.md)

---

## 🎨 Next.js 16 App Router Structure

The frontend is structured using Next.js 16 App Router with React 19 Client Components (`"use client"`) and Server Components.

### Key Route Directories:
- `frontend/app/page.tsx`: Landing page featuring Hero Carousel, Popular Products, & Brand Values.
- `frontend/app/products/`: Catalog Grid, Category Filter Tabs, Price Sort, & Product Details (`[id]`).
- `frontend/app/cart/`: Combined Cart & Checkout Page (`cart-and-checkout.tsx`).
- `frontend/app/orders/`: Customer Order History list with status filters (`page.tsx`) & Order Tracking Timeline (`[id]/page.tsx`).
- `frontend/app/(admin)/dashboard/`: Admin Dashboard layout wrapper, KPI Analytics (`page.tsx`), Orders Management (`orders/`), Products Table (`products/`), & User Directory (`users/`).

---

## ⚡ Socket.IO Real-time Integration (`SocketProvider.tsx`)

Real-time events are managed by a centralized React Context Provider wrapped around the root layout.

### Handled Real-Time Events:
1. `stock_update`: Triggers dynamic stock badge refreshes across product cards.
2. `order_status_update`: Displays a floating toast notification when an admin updates the user's order status (e.g. "Pesanan #12 dikirim").
3. `new_order_notification`: Emits a alert toast on the Admin Dashboard topbar whenever a customer places a new order.
4. `cart_update`: Synchronizes active cart count badges in the header navbar.

---

## 💳 Midtrans Payment Integration (`frontend/lib/payment.ts`)

Midtrans Snap Payment is encapsulated in `frontend/lib/payment.ts` so both customer pages (`/orders`) and admin detail pages can trigger payment popups without duplicate code.

### Execution Flow:
```typescript
import { processOrderPayment } from "@/lib/payment";

// Trigger Snap Modal for Order #12
await processOrderPayment(12, () => {
  // Callback executed on successful payment completion
  refreshOrders();
});
```

### Snap Script Ingestion (`app/layout.tsx`):
```html
<script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
/>
```

---

## 🖼️ Image Resolution Helper (`frontend/lib/image.ts`)

To avoid Next.js Image optimization errors on external/localhost backend uploads:

```typescript
import { resolveProductImage } from "@/lib/image";

const { src, unoptimized } = resolveProductImage(product.image, "/placeholder.png");

// In JSX:
<Image src={src} unoptimized={unoptimized} alt={product.name} width={80} height={80} />
```

---

[Next: Security & Best Practices ➡️](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/06-security-and-best-practices.md)
