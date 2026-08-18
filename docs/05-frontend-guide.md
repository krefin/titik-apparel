# 05. Panduan Frontend Architecture & UI/UX

[🏠 Home Utama](../README.md) \| [📚 Docs Hub](./README.md) \| [⬅️ Kembali: 04. Backend API](./04-backend-api.md) \| [Lanjut: 06. Keamanan & Best Practices ➡️](./06-security-and-best-practices.md)

---

## 🎨 Struktur Next.js 16 App Router

Frontend dikembangkan menggunakan arsitektur Next.js 16 App Router dengan React 19 Client Components (`"use client"`) dan Server Components.

### Direktori Rute Utama:
- `frontend/app/page.tsx`: Halaman utama featuring Hero Carousel, Produk Populer, & Nilai Brand.
- `frontend/app/products/`: Katalog Produk, Tab Filter Kategori, Urutkan Harga, & Detail Produk (`[id]`).
- `frontend/app/cart/`: Halaman Kombinasi Keranjang Belanja & Form Checkout (`cart-and-checkout.tsx`).
- `frontend/app/orders/`: Riwayat Pesanan Pelanggan dengan filter status (`page.tsx`) & Timeline Pelacakan (`[id]/page.tsx`).
- `frontend/app/(admin)/dashboard/`: Layout wrapper Dashboard Admin, Analitik KPI (`page.tsx`), Tabel Pesanan (`orders/`), Tabel Produk (`products/`), & Direktori Pengguna (`users/`).

---

## ⚡ Integrasi Real-Time Socket.IO (`SocketProvider.tsx`)

Event real-time dikelola secara terpusat oleh Context Provider di `app/providers/SocketProvider.tsx`.

### Event Real-Time yang Ditangani:
1. `stock_update`: Mengubah badge stok secara dinamis di seluruh kartu produk.
2. `order_status_update`: Menampilkan notifikasi toast melayang saat status pesanan diubah oleh admin (misal: "Pesanan #12 dikirim").
3. `new_order_notification`: Menampilkan toast peringatan pada topbar admin saat pelanggan membuat pesanan baru.
4. `cart_update`: Menyinkronkan jumlah badge keranjang di navbar secara instan.

---

## 💳 Integrasi Pembayaran Midtrans (`frontend/lib/payment.ts`)

Eksekusi Midtrans Snap dibungkus dalam modul terpusat `frontend/lib/payment.ts` agar halaman pelanggan maupun admin dapat memicu popup Snap tanpa penulisan ulang kode.

### Contoh Penggunaan:
```typescript
import { processOrderPayment } from "@/lib/payment";

// Pemicu Modal Snap untuk Order #12
await processOrderPayment(12, () => {
  // Callback dieksekusi setelah pembayaran berhasil
  refreshOrders();
});
```

### Ingestion Script Snap (`app/layout.tsx`):
```html
<script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
/>
```

---

## 🖼️ Helper Resolusi Gambar (`frontend/lib/image.ts`)

Untuk mencegah error optimasi gambar Next.js pada uploads lokal/backend eksternal:

```typescript
import { resolveProductImage } from "@/lib/image";

const { src, unoptimized } = resolveProductImage(product.image, "/placeholder.png");

// Dalam JSX:
<Image src={src} unoptimized={unoptimized} alt={product.name} width={80} height={80} />
```

---

[⬅️ Kembali: 04. Backend API](./04-backend-api.md) \| [📚 Docs Hub](./README.md) \| [Lanjut: 06. Keamanan & Best Practices ➡️](./06-security-and-best-practices.md)
