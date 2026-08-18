# 01. Introduction & Overview - Titik Apparel

[Back to Documentation Index](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/README.md)

---

## 📌 About Titik Apparel

**Titik Apparel** is a full-stack, modern e-commerce web application engineered for premium apparel retail. It combines an intuitive, visually rich customer shopping experience with a powerful administrative dashboard for managing products, monitoring inventory, tracking orders, and viewing real-time sales metrics.

---

## ✨ Key Features

### 🛍️ Customer Experience
- **Hero Showcase Carousel**: Dynamic hero section featuring high-converting product highlights and promotional banners.
- **Product Catalog & Quick Filter**: Instant search, category filters, price sorting, and dynamic stock availability indicators.
- **Interactive Shopping Cart**: Synchronized cart items with persistent backend state and client-side instant quantity adjustments.
- **Seamless Midtrans Payment Checkout**: Direct Midtrans Snap modal integration supporting Credit Card, Bank Transfer (Virtual Account), Mandiri Bill, and e-Wallets (Gopay, ShopeePay, QRIS).
- **Interactive Order Tracking Page**:
  - Live status tracking tabs (`Semua`, `Menunggu Bayar`, `Diproses`, `Dikirim`, `Lunas`, `Selesai`, `Dibatalkan`).
  - Visual 5-step progress bar (`OrderTimeline`): Created ➔ Paid ➔ Processing ➔ Shipped ➔ Completed.
  - Instant payment trigger for pending orders directly from order cards.
- **Real-Time WebSockets Notifications**: Floating toast notifications powered by Socket.IO for stock updates, cart changes, and order status transitions.

### 📊 Admin Executive Dashboard
- **Executive KPI Metrics Overview**: Live summary cards showing Total Revenue, Total Orders, Total Products, and Total Registered Users.
- **Interactive Order Management**:
  - Filter orders by status pills (`Menunggu`, `Diproses`, `Dikirim`, `Lunas`, `Selesai`, `Dibatalkan`).
  - One-click status update buttons with real-time customer notification.
  - Detailed order view with customer contact details, delivery address, shipping courier, and snapshot item prices.
- **Product Inventory Management**: Low-stock warning pills, product thumbnail previews, search, pagination, and full CRUD operations.
- **User Management**: User directory with role badges (`ADMIN` vs `CUSTOMER`), initial avatars, and search capability.

---

## 🎨 Design System & Visual Aesthetics

- **Color Palette**: Curated dark slate background (`bg-slate-950`), glowing sky accent blues (`sky-500`), emerald greens for financial metrics, and amber/rose warning indicators.
- **Glassmorphism**: Soft background blurs (`backdrop-blur-md`), subtle translucent borders (`border-white/10` / `border-slate-800`), and depth shadows.
- **Typography**: Clean sans-serif hierarchy powered by Google Fonts (Inter / Roboto).
- **Responsive Layout**: Mobile-first architecture featuring responsive drawer menus, sticky headers, and adaptable grid layouts.

---

[Next: System Architecture & ERD Diagram ➡️](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/02-architecture.md)
