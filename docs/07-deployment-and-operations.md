# 07. Production Deployment & Panduan Operasional

[🏠 Home Utama](../README.md) \| [📚 Docs Hub](./README.md) \| [⬅️ Kembali: 06. Keamanan & Best Practices](./06-security-and-best-practices.md) \| [Ke Docs Hub 🔝](./README.md)

---

## 🚀 Overview Deployment Produksi

Untuk mendeploy **Titik Apparel** ke lingkungan produksi (seperti VPS Ubuntu, DigitalOcean, AWS, atau Vercel), ikuti panduan operasional di bawah ini.

---

## 📦 1. Perintah Build Produksi

### Build & Start Backend:
```bash
cd backend
npm install --production
npx prisma migrate deploy
npm start
```

### Build & Start Frontend:
```bash
cd frontend
npm install
npm run build
npm run start
```

---

## ⚙️ 2. Manajemen Proses dengan PM2

Gunakan [PM2](https://pm2.keymetrics.io/) untuk mengelola proses Node.js backend dan Next.js cluster secara otomatis dengan *zero-downtime reloads*.

### Contoh `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: "titik-backend",
      cwd: "./backend",
      script: "src/server.js",
      instances: 2,
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
    {
      name: "titik-frontend",
      cwd: "./frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 2,
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

#### Jalankan PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🌐 3. Konfigurasi Nginx Reverse Proxy & SSL

Gunakan Nginx sebagai reverse proxy dengan SSL Let's Encrypt (`certbot`) untuk memproksi trafik secara aman.

### Konfigurasi Nginx (`/etc/nginx/sites-available/titik-apparel`):
```nginx
# Redirect HTTP ke HTTPS
server {
    listen 80;
    server_name titikapparel.com www.titikapparel.com;
    return 301 https://$host$request_uri;
}

# Main HTTPS Server
server {
    listen 443 ssl http2;
    server_name titikapparel.com www.titikapparel.com;

    ssl_certificate /etc/letsencrypt/live/titikapparel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/titikapparel.com/privkey.pem;

    # Frontend Next.js App Router
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend Express API Endpoints
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_header;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # DANA Webhook Endpoint (RAW Body)
    location /v1.0/debit/notify {
        proxy_pass http://localhost:4000/v1.0/debit/notify;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_header;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Connections (Socket.IO)
    location /socket.io/ {
        proxy_pass http://localhost:4000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 🛠️ 4. Pemeliharaan Operasional & Troubleshooting

### Cadangkan Database (MySQL Backup):
```bash
mysqldump -u root -p titik_apparel_db > backup_$(date +%F).sql
```

### Memeriksa Log Aplikasi:
```bash
pm2 logs titik-backend
pm2 logs titik-frontend
```

---

[⬅️ Kembali: 06. Keamanan & Best Practices](./06-security-and-best-practices.md) \| [📚 Docs Hub](./README.md) \| [Ke Top Documentation Hub 🔝](./README.md)
