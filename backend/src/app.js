import express from "express";
import cors from "cors";
import helmet from "helmet";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import adminStatsRoutes from "./routes/adminStats.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

export default app;
