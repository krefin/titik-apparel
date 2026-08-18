# 03. Setup & Panduan Instalasi Environment

[🏠 Home Utama](../README.md) \| [📚 Docs Hub](./README.md) \| [⬅️ Kembali: 02. Arsitektur Sistem](./02-architecture.md) \| [Lanjut: 04. Backend API Reference ➡️](./04-backend-api.md)

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum menginstall **Titik Apparel**, pastikan perangkat lunak berikut telah terinstal pada lingkungan Anda:

- **Node.js**: `v18.x` atau `v20.x` (LTS sangat direkomendasikan)
- **npm**: `v9.x` atau `v10.x`
- **Database**: MySQL `8.0+` (atau MariaDB / SQLite)
- **Git**: Terinstal untuk manajemen kode

---

## 🛠️ Langkah-Langkah Instalasi

### Langkah 1: Kloning Repositori
```bash
git clone https://github.com/your-username/titik-apparel.git
cd titik-apparel
```

---

### Langkah 2: Setup Backend (`backend/`)

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Install dependensi package:
   ```bash
   npm install
   ```

3. Buat berkas `.env` dari template contoh berikut:
   ```bash
   cp env.example .env
   ```

#### 🔒 Template `.env.example` Backend (Aman & Bebas Leak)
```env
# Konfigurasi Server
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

# Kinetik Database Connection (MySQL / MariaDB / SQLite)
DATABASE_URL="mysql://root:your_password@localhost:3306/titik_apparel_db"

# Rahasia Autentikasi JWT (Minimal 32 Karakter)
JWT_SECRET="your_super_secret_jwt_key_here_min_32_chars"

# Konfigurasi Payment Gateway Midtrans
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_SANDBOX_SERVER_KEY"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY"
MIDTRANS_IS_PRODUCTION=false

# Konfigurasi Payment Gateway DANA (Sandbox)
MERCHANT_ID="Dana_merchant_ID_example"
X_PARTNER_ID="Dana_Client_ID_example"
PRIVATE_KEY="Dana_Private_Key_example"
DANA_PUBLIC_KEY="Dana_Public_Key_example"
DANA_ENV=sandbox
FRONTEND_URL=http://localhost:3000
```

4. Jalankan Migrasi Database Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```

5. (Opsional) Seed Data Awal Admin & Produk:
   ```bash
   npx prisma db seed
   ```

6. Jalankan Server Development Backend:
   ```bash
   npm run dev
   ```
   *Server backend API akan aktif di `http://localhost:4000`.*

---

### Langkah 3: Setup Frontend (`frontend/`)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```

2. Install dependensi package:
   ```bash
   npm install
   ```

3. Buat berkas `.env.local` dari template contoh berikut:

#### 🔒 Template `.env.local.example` Frontend (Aman & Bebas Leak)
```env
# URL API Backend & Server WebSockets
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Client Key Midtrans untuk Client-side Snap Modal
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY
```

4. Jalankan Server Development Frontend:
   ```bash
   npm run dev
   ```
   *Aplikasi frontend Next.js akan aktif di `http://localhost:3000`.*

---

## 🧪 Verifikasi Instalasi & Automated Tests

Untuk memastikan seluruh komponen berjalan sempurna tanpa masalah, jalankan suite pengujian otomatis:

### 1. Jalankan Unit & Integration Test Backend:
```bash
cd backend
npm test
```
*Hasil yang Diharapkan: `7 passed, 7 total` test suites (52 tests passed).*

### 2. Jalankan TypeScript Type Check Frontend:
```bash
cd frontend
npm run typecheck
```
*Hasil yang Diharapkan: `0 errors`.*

---

[⬅️ Kembali: 02. Arsitektur Sistem](./02-architecture.md) \| [📚 Docs Hub](./README.md) \| [Lanjut: 04. Backend API Reference ➡️](./04-backend-api.md)
