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
import contactRoutes from "./routes/contact.js";
import { apiLimiter } from "./middlewares/rateLimit.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.js";
import { env } from "./lib/env.js";

const app = express();

const helmetOptions = {
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: "deny" },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
};

const staticOptions = {
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", env.clientOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    res.setHeader("X-Content-Type-Options", "nosniff");
  },
};

app.disable("x-powered-by");
app.use(cookieParser());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-midtrans-signature-key"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(helmet(helmetOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limit global untuk semua /api
app.use("/api", apiLimiter);

app.use("/uploads", express.static("uploads", staticOptions));

app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/kontak", contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
