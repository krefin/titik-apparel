# 01. Pendahuluan & Overview - Titik Apparel

[🏠 Home Utama](../README.md) \| [📚 Docs Hub](./README.md) \| [⬅️ Kembali: Docs Hub](./README.md) \| [Lanjut: 02. Arsitektur Sistem ➡️](./02-architecture.md)

---

## 📌 Tentang Titik Apparel

**Titik Apparel** adalah aplikasi web e-commerce full-stack modern berkinerja tinggi yang dirancang khusus untuk ritel pakaian premium. Aplikasi ini menggabungkan pengalaman berbelanja pelanggan yang intuitif dan kaya secara visual dengan dashboard administratif yang andal untuk mengelola produk, memantau stok, melacak pesanan, dan melihat metrik penjualan secara real-time.

---

## ✨ Fitur Utama Platform

### 🛍️ Pengalaman Pelanggan (Customer Experience)
- **Hero Showcase Carousel**: Seksi banner hero dinamis dengan sorotan produk unggulan dan promo terkini.
- **Katalog Produk & Filter Cepat**: Pencarian instan, filter kategori, pengurutan harga, dan indikator ketersediaan stok real-time.
- **Keranjang Belanja Interaktif**: Keranjang belanja tersinkronisasi otomatis dengan backend dan penyesuaian kuantitas instan.
- **Pembayaran Midtrans & DANA**: Integrasi modal Midtrans Snap dan DANA Payment yang mendukung Kartu Kredit, Transfer Bank (Virtual Account), E-Wallet (Gopay, ShopeePay, QRIS, DANA).
- **Pelacakan Pesanan Interaktif**:
  - Tab status pesanan (`Semua`, `Menunggu Bayar`, `Diproses`, `Dikirim`, `Lunas`, `Selesai`, `Dibatalkan`).
  - Bar kemajuan visual 5 tahap (`OrderTimeline`): Pesanan Dibuat ➔ Lunas ➔ Diproses ➔ Dikirim ➔ Selesai.
  - Tombol bayar langsung untuk pesanan pending dari kartu pesanan.
- **Notifikasi Real-Time WebSockets**: Toast notification terapung berbasis Socket.IO untuk pembaruan stok, keranjang, dan perubahan status pesanan.

### 📊 Dashboard Eksekutif Admin
- **Ringkasan Metrik KPI Eksekutif**: Kartu ringkasan live yang menampilkan Total Pendapatan, Total Pesanan, Total Produk, dan Total Pengguna Terdaftar.
- **Manajemen Pesanan Interaktif**:
  - Filter pesanan berdasarkan pill status (`Menunggu`, `Diproses`, `Dikirim`, `Lunas`, `Selesai`, `Dibatalkan`).
  - Tombol ubah status sekali klik dengan notifikasi real-time ke pelanggan.
  - Tampilan detail pesanan dengan kontak pelanggan, alamat pengiriman, kurir ekspedisi, dan snapshot harga barang.
- **Manajemen Inventaris Produk**: Indikator peringatan stok menipis, pratinjau thumbnail produk, pencarian, paginasi, dan operasi CRUD lengkap.
- **Manajemen Pengguna**: Direktori pengguna dengan badge peran (`ADMIN` vs `CUSTOMER`), avatar inisial, dan fitur pencarian.

---

## 🎨 Sistem Desain & Estetika Visual

- **Palet Warna**: Latar belakang dark slate eksklusif (`bg-slate-950`), aksen biru sky glowing (`sky-500`), hijau emerald untuk metrik keuangan, serta warna peringatan amber dan rose.
- **Glassmorphism**: Efek buram latar belakang yang halus (`backdrop-blur-md`), batas translusen elegan (`border-white/10` / `border-slate-800`), dan bayangan kedalaman.
- **Tipografi**: Hirarki sans-serif bersih berbasis Google Fonts (Inter / Roboto).
- **Tata Letak Responsif**: Arsitektur mobile-first dengan menu drawer responsif, header melayang (sticky), dan grid dinamis.

---

[⬅️ Kembali: Docs Hub](./README.md) \| [📚 Docs Hub](./README.md) \| [Lanjut: 02. Arsitektur Sistem ➡️](./02-architecture.md)
