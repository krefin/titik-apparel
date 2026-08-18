# 07. Production Deployment & Operations Guide

[Back to Documentation Index](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/README.md)

---

## 🚀 Production Deployment Overview

To deploy **Titik Apparel** to production (e.g. VPS, Cloud Server, Vercel/DigitalOcean), follow the operational guidelines below.

---

## 📦 1. Production Build Commands

### Backend Build & Start:
```bash
cd backend
npm install --production
npx prisma migrate deploy
npm start
```

### Frontend Production Build:
```bash
cd frontend
npm install
npm run build
npm run start
```

---

## ⚙️ 2. Process Management with PM2

Use [PM2](https://pm2.keymetrics.io/) to manage backend Node.js and Next.js cluster processes for automatic restarts and zero-downtime reloads.

### `ecosystem.config.js` Example:
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

#### Start PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🌐 3. Nginx Reverse Proxy & SSL Configuration

Configure Nginx as a reverse proxy with Let's Encrypt SSL (`certbot`) to forward incoming traffic securely.

### Nginx Site Configuration (`/etc/nginx/sites-available/titik-apparel`):
```nginx
# Redirect HTTP to HTTPS
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

    # Frontend App Router (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Endpoints
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

## 🛠️ 4. Operational Maintenance & Troubleshooting

### Database Backup (MySQL):
```bash
mysqldump -u root -p titik_apparel_db > backup_$(date +%F).sql
```

### Checking Process Logs:
```bash
pm2 logs titik-backend
pm2 logs titik-frontend
```

---

[Back to Documentation Index 🔝](file:///c:/Users/Alfin/Documents/NextJs/titik-apparel/docs/README.md)
