# 🛍️ Titik Apparel - Full-Stack E-Commerce Platform

Titik Apparel is a modern e-commerce web application built with **Next.js 16 (App Router)**, **React 19**, **Node.js Express**, **Prisma ORM**, **Socket.IO**, and **Midtrans Payment Gateway**.

---

## 📖 Comprehensive Documentation

Complete documentation is available inside the [`docs/`](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/README.md) folder:

- 📌 [**01. Introduction & Overview**](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/01-introduction.md): Features, Tech Stack, & Design System
- 🏗️ [**02. System Architecture & ERD**](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/02-architecture.md): Topology, Mermaid Flow Diagrams, & Database ERD
- 🛠️ [**03. Setup & Installation Guide**](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/03-setup-and-installation.md): Step-by-step Installation & `.env.example` Templates
- 🔑 [**04. Backend REST API Reference**](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/04-backend-api.md): Complete Endpoints, Zod Validation, & Payloads
- 🎨 [**05. Frontend Guide**](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/05-frontend-guide.md): Next.js App Router, Socket Provider, & Midtrans Snap Helper
- 🛡️ [**06. Security & Best Practices**](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/06-security-and-best-practices.md): CSP, Helmet, Rate Limit, RBAC, Anti-Price Tampering, & Tests
- 🚀 [**07. Deployment & Operations**](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/07-deployment-and-operations.md): Production Setup (PM2, Nginx SSL, Docker)

---

## ⚡ Quick Start

```bash
# 1. Start Backend API
cd backend
npm install
cp env.example .env
npx prisma migrate dev
npm run dev

# 2. Start Frontend App (in another terminal)
cd frontend
npm install
npm run dev
```

- Frontend App: `http://localhost:3000`
- Backend API: `http://localhost:4000`
