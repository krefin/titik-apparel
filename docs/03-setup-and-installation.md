# 03. Setup & Installation Guide

[Back to Documentation Index](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/README.md)

---

## 📋 Prerequisites

Before setting up **Titik Apparel**, ensure you have installed the following software on your environment:

- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **npm**: `v9.x` or `v10.x`
- **Database**: MySQL `8.0+` (or MariaDB / SQLite)
- **Git**: Installed for version control

---

## 🛠️ Step-by-Step Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/titik-apparel.git
cd titik-apparel
```

---

### Step 2: Backend Setup (`backend/`)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from the example template below:
   ```bash
   cp env.example .env
   ```

#### 🔒 Backend `.env.example` Template
```env
# Server Configuration
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

# Database Connection (MySQL / MariaDB / SQLite)
DATABASE_URL="mysql://root:your_password@localhost:3306/titik_apparel_db"

# JWT Authentication Secret
JWT_SECRET="your_super_secret_jwt_key_here_min_32_chars"

# Midtrans Payment Gateway Configuration
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_SANDBOX_SERVER_KEY"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY"
MIDTRANS_IS_PRODUCTION=false
```

4. Run Prisma Database Migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. (Optional) Seed initial Database / Admin Account:
   ```bash
   npx prisma db seed
   ```

6. Start Backend Development Server:
   ```bash
   npm run dev
   ```
   *The backend API server will start on `http://localhost:4000`.*

---

### Step 3: Frontend Setup (`frontend/`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file from the example template below:

#### 🔒 Frontend `.env.local.example` Template
```env
# Public Next.js API Base URL & WebSocket Host
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Public Midtrans Client Key for Client-side Snap Modal
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY
```

4. Start Frontend Development Server:
   ```bash
   npm run dev
   ```
   *The Next.js frontend application will start on `http://localhost:3000`.*

---

## 🧪 Verifying Setup & Automated Tests

To ensure your installation is fully functional, run the built-in automated test suites:

### 1. Run Backend Jest Unit & Integration Tests:
```bash
cd backend
npm test
```
*Expected Output: `7 passed, 7 total` test suites (52 tests passed).*

### 2. Run Frontend TypeScript Type Check:
```bash
cd frontend
npm run typecheck
```
*Expected Output: `0 errors`.*

---

[Next: Backend API Reference ➡️](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/04-backend-api.md)
