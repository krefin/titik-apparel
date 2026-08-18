// src/lib/env.js
import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["DATABASE_URL", "JWT_SECRET"];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[env] Variabel lingkungan wajib tidak ditemukan: ${missing.join(", ")}. ` +
      "Salin backend/env.example menjadi backend/.env lalu isi nilainya."
  );
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
  midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
  midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
};
