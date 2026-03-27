import express from "express";
import cors from "cors";
import helmet from "helmet";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import adminStatsRoutes from "./routes/adminStats.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import userRoutes from "./routes/user.js";
import imageRoutes from "./routes/image.js";
import cookieParser from "cookie-parser";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const helmetOptions = {
  // Izinkan resource statis di-serve lintas-origin
  crossOriginResourcePolicy: { policy: "cross-origin" },

  // Jika Anda punya contentSecurityPolicy custom, masukkan di sini.
  // contentSecurityPolicy: false, // contoh: nonaktifkan CSP jika perlu debugging
};
// Pastikan static files mengirim Access-Control-Allow-Origin
const staticOptions = {
  setHeaders: (res, path) => {
    // atur sesuai CLIENT_ORIGIN Anda; jangan gunakan '*' jika Anda mengandalkan cookie credentials
    res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
    // optional: izinkan beberapa header lain bila perlu
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  },
};
// --- PASANG cookieParser SEBELUM ROUTES ---
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_ORIGIN, // hanya izinkan origin ini
    credentials: true, // penting agar cookie dikirim/diterima
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(helmet(helmetOptions));
app.use("/api/payment/dana/notify", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads", staticOptions));
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

export default app;
