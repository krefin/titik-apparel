import express from "express";
import {
  createPaymentToken,
  paymentNotification,
} from "../controllers/paymentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import prisma from "../lib/prisma.js";
import  { consultPay } from "../controllers/consulPayController.js";
import { createOrder } from "../controllers/createOrderController.js";
import { queryPayment } from "../controllers/queryPaymentController.js";
import { cancelOrder } from "../controllers/cencelOrderController.js";
import { refundOrder } from "../controllers/refundOrderController.js";

const router = express.Router();
// Middleware untuk set req.order dari body.orderId
export const setOrderFromBody = async (req, res, next) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "Order ID required" });

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { user: true },
  });

  if (!order) return res.status(404).json({ error: "Order not found" });

  req.order = order;
  next();
};

// gunakan di route
router.post("/token", authMiddleware, setOrderFromBody, createPaymentToken);

// menerima callback Midtrans
router.post("/notification", paymentNotification);

// dana Payment gateway
router.post("/consult-pay", consultPay);
router.post("/create-order", createOrder);
router.post("/query-payment", queryPayment);
router.post("/cancel-order", cancelOrder);
router.post("/refund-order", refundOrder);

export default router;
