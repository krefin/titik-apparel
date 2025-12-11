import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrdersByUser);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, updateOrderStatus);

export default router;
