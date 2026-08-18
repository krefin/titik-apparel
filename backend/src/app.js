import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import adminStatsRoutes from "./routes/adminStats.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import userRoutes from "./routes/user.js";
import imageRoutes from "./routes/image.js";

import danaWebhookService from "./services/danaWebhookService.js";

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

/**
 * 🔐 BASIC SECURITY & CORS
 */
app.use(cookieParser());

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/**
 * 🔥 DANA WEBHOOK (WAJIB PALING ATAS & RAW BODY)
 * ⚠️ JANGAN DIPINDAH
 */
app.post(
  "/v1.0/debit/notify",
  express.raw({ type: "application/json" }),
  (req, res) => danaWebhookService.handleFinishNotify(req, res)
);
app.get("/v1.0/debit/notify", (req, res) => {
  res.status(200).send("OK");
});

/**
 * ❗ GLOBAL BODY PARSER (SETELAH WEBHOOK)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 📦 STATIC FILES
 */
app.use("/uploads", express.static("uploads"));

/**
 * 📡 API ROUTES
 */
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);

/**
 * ❤️ HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

/**
 * ❌ 404 HANDLER
 */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/**
 * ❌ GLOBAL ERROR HANDLER
 */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    message: "Internal Server Error",
  });
});

export default app;