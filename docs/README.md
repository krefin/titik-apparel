# 🛍️ Titik Apparel - Documentation Hub

Welcome to the official documentation for **Titik Apparel**, a modern, high-performance E-Commerce platform built with Next.js 16 (App Router), React 19, Node.js Express, Prisma ORM, Socket.IO real-time notifications, and Midtrans Payment Gateway.

---

## 📚 Table of Contents

| Section | Description | Link |
| :--- | :--- | :--- |
| **01. Introduction** | Overview, Key Features, Tech Stack, Design Aesthetics | [01-introduction.md](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/01-introduction.md) |
| **02. Architecture** | System Topology, Folder Structure, Mermaid Diagrams & Database ERD | [02-architecture.md](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/02-architecture.md) |
| **03. Setup & Installation** | Prerequisites, Step-by-step Installation & Environment Variables | [03-setup-and-installation.md](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/03-setup-and-installation.md) |
| **04. Backend API Reference** | Complete REST Endpoints, Zod Validation Schemas & Error Codes | [04-backend-api.md](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/04-backend-api.md) |
| **05. Frontend Guide** | App Router, Socket Provider, UI Components & Midtrans Snap Integration | [05-frontend-guide.md](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/05-frontend-guide.md) |
| **06. Security & Best Practices** | CSP, Helmet, Rate Limiting, JWT RBAC, Anti-Price Tampering & Testing | [06-security-and-best-practices.md](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/06-security-and-best-practices.md) |
| **07. Deployment & Operations** | Production Setup (PM2/Docker), Nginx Reverse Proxy, DB Maintenance | [07-deployment-and-operations.md](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/07-deployment-and-operations.md) |

---

## 🚀 Quick Tech Stack Overview

### **Frontend**
- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS v4 + Glassmorphism & Micro-animations
- **State & UI**: Lucide Icons, Radix UI Primitives, Custom Hooks
- **Real-Time**: `socket.io-client` with custom toast notification provider
- **Payment Gateway**: Midtrans Snap Integration (`processOrderPayment`)

### **Backend**
- **Runtime**: Node.js & Express.js (ES Modules)
- **ORM & DB**: Prisma ORM with MySQL / SQLite
- **Security**: Helmet, Express Rate Limit, Cookie-Parser, JWT, Zod Validation
- **Real-Time**: Socket.IO server emitting stock & order updates
- **Testing**: Jest unit & integration test suites (52 tests passed)

---

## ⚡ Quick Start Checklist

1. Clone repository & install dependencies in both `frontend` and `backend`.
2. Configure `.env` in `backend/` and `.env.local` in `frontend/` using provided `.env.example` templates.
3. Run Prisma migrations: `npx prisma migrate dev` in `backend/`.
4. Start backend server: `npm run dev` in `backend/` (runs on `http://localhost:4000`).
5. Start frontend dev server: `npm run dev` in `frontend/` (runs on `http://localhost:3000`).

---

> 🔑 **Security Note**: Never commit `.env` or `.env.local` containing actual production secrets. Use the safely documented `.env.example` templates provided in `03-setup-and-installation.md`.
