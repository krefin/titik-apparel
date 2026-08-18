# 🛍️ Titik Apparel - Full-Stack E-Commerce Platform

> **Titik Apparel** adalah platform e-commerce busana modern dengan performa tinggi yang dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **Node.js Express**, **Prisma ORM**, **Socket.IO (Real-Time Notifications)**, serta **Midtrans & DANA Payment Gateway**.

---

## 📖 Pusat Dokumentasi Lengkap

Dokumentasi proyek telah disusun secara terstruktur, rapi, dan saling terhubung. Klik tombol atau tautan di bawah ini untuk membuka dokumentasi lengkap:

[![Docs Hub](https://img.shields.io/badge/📚_Buka_Dokumentasi_Lengkap-Docs_Hub-0284c7?style=for-the-badge)](./docs/README.md)

---

### 🗺️ Peta Navigasi Dokumentasi

| Bab | Deskripsi & Topik Utama | Akses Cepat |
| :--- | :--- | :--- |
| **01. Pendahuluan** | Overview, Fitur Pelanggan & Admin, Design System & Branding | [📖 Baca Bab 01](./docs/01-introduction.md) |
| **02. Arsitektur Sistem** | Topologi Sistem, Diagram Mermaid, Hierarchy Folder & Database ERD | [🏗️ Baca Bab 02](./docs/02-architecture.md) |
| **03. Setup & Instalasi** | Prerequisites, Panduan Instalasi FE & BE, `.env.example` (Safe) | [🛠️ Baca Bab 03](./docs/03-setup-and-installation.md) |
| **04. Backend API Reference** | Referensi REST API Lengkap, Skema Zod & Payload Request/Response | [🔑 Baca Bab 04](./docs/04-backend-api.md) |
| **05. Panduan Frontend** | Next.js App Router, Provider Socket.IO & Integration Helper Midtrans | [🎨 Baca Bab 05](./docs/05-frontend-guide.md) |
| **06. Keamanan & Best Practices** | CSP, Helmet, Rate Limiting, JWT RBAC, Anti-Price Tampering & Tests | [🛡️ Baca Bab 06](./docs/06-security-and-best-practices.md) |
| **07. Production & Operasional** | Production Build (PM2 Cluster, Nginx Reverse Proxy & SSL) | [🚀 Baca Bab 07](./docs/07-deployment-and-operations.md) |

---

## ⚡ Quick Start (Jalankan Lokal)

```bash
# 1. Jalankan Backend API (Port 4000)
cd backend
npm install
cp env.example .env
npx prisma migrate dev
npm run dev

# 2. Jalankan Frontend Next.js (Port 3000)
cd frontend
npm install
npm run dev
```

- 🌐 **Frontend App**: `http://localhost:3000`
- ⚙️ **Backend API**: `http://localhost:4000`
- 📚 **Dokumentasi**: [docs/README.md](./docs/README.md)
