import express from "express";
import {
  createPaymentToken,
  paymentNotification,
} from "../controllers/paymentController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  paymentTokenSchema,
  paymentNotificationSchema,
} from "../utils/validators.js";
import { AppError } from "../middlewares/errorHandler.js";
import prisma from "../lib/prisma.js";
import { consultPay } from "../controllers/consulPayController.js";
import { createOrder } from "../controllers/createOrderController.js";
import { queryPayment } from "../controllers/queryPaymentController.js";
import { cancelOrder } from "../controllers/cencelOrderController.js";
import { refundOrder } from "../controllers/refundOrderController.js";
// import danaWebhookService from "../services/danaWebhookService.js";

const router = express.Router();

// Middleware untuk set req.order dari body.orderId
export const setOrderFromBody = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { user: true },
    });

    if (!order) throw new AppError(404, "Order not found");

    // IDOR protection: hanya pemilik order atau admin yang boleh bayar order ini
    if (order.userId !== req.user.id && req.user.role !== "admin") {
      throw new AppError(403, "Order ini bukan milik Anda");
    }

    req.order = order;
    next();
  } catch (err) {
    next(err);
  }
};

router.post(
  "/token",
  authMiddleware,
  validate(paymentTokenSchema),
  setOrderFromBody,
  createPaymentToken
);

// Menerima callback (webhook) dari Midtrans ATAU dari FE (dengan session user)
router.post(
  "/notification",
  optionalAuthMiddleware,
  validate(paymentNotificationSchema),
  paymentNotification
);

export default router;