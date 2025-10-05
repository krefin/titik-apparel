// src/routes/adminStats.js
import express from "express";
import {
  getStats,
  getMonthlySales,
} from "../controllers/adminStatsController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua endpoint hanya untuk ADMIN
router.get("/", authMiddleware, isAdmin, getStats);
router.get("/monthly", authMiddleware, isAdmin, getMonthlySales);

export default router;
