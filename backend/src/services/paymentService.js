// src/services/paymentService.js
import crypto from "crypto";
import snap from "../lib/midtrans.js";
import { updateOrderStatus } from "./orderService.js";
import { AppError } from "../middlewares/errorHandler.js";
import { env } from "../lib/env.js";
import prisma from "../lib/prisma.js";

export const createSnapToken = async (order) => {
  const amount = order.grandTotal || order.totalPrice || 0;

  const parameter = {
    transaction_details: {
      order_id: order.id.toString(),
      gross_amount: amount,
    },
    credit_card: { secure: true },
    customer_details: {
      first_name: order.user?.name || "Customer",
      email: order.user?.email || "",
      phone: order.user?.telephone || "",
    },
  };

  const snapResponse = await snap.createTransaction(parameter);
  return {
    ...snapResponse,
    clientKey: env.midtransClientKey,
  };
};

const isSuccessfulStatus = (status) =>
  status === "capture" || status === "settlement";

const isFailedStatus = (status) =>
  status === "deny" || status === "cancel" || status === "expire";

const toOrderStatus = (transactionStatus) => {
  if (isSuccessfulStatus(transactionStatus)) return "paid";
  if (isFailedStatus(transactionStatus)) return "failed";
  return "pending";
};

// Verifikasi signature sesuai dokumentasi Midtrans:
// SHA512(order_id + status_code + gross_amount + ServerKey)
export const verifySignature = (notification, signature) => {
  if (!signature) return false;
  const { order_id, status_code = "", gross_amount = "" } = notification;
  const raw = `${order_id}${status_code}${gross_amount}${env.midtransServerKey}`;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === signature;
};

export const handlePaymentNotification = async (notification, signature, user = null) => {
  const orderId = Number(notification.order_id || notification.orderId);
  if (isNaN(orderId)) {
    throw new AppError(400, "ID pesanan tidak valid");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");

  if (signature) {
    if (!verifySignature(notification, signature)) {
      throw new AppError(401, "Signature tidak valid");
    }
  } else if (user) {
    // Notifikasi dari client FE (fallback saat testing localhost di mana webhook Midtrans tidak bisa menembak localhost)
    if (order.userId !== user.id && user.role !== "admin") {
      throw new AppError(403, "Order ini bukan milik Anda");
    }
  } else {
    throw new AppError(401, "Signature atau otentikasi pengguna tidak valid");
  }

  // Pastikan jumlah yang dibayar sesuai (mencegah manipulasi)
  if (notification.gross_amount != null) {
    const paidAmount = Math.round(Number(notification.gross_amount));
    const expectedAmount = order.grandTotal || order.totalPrice;
    if (paidAmount !== expectedAmount) {
      throw new AppError(400, "Jumlah pembayaran tidak sesuai");
    }
  }

  const txStatus =
    notification.transaction_status ||
    notification.transactionStatus ||
    notification.status ||
    "";
  const status = toOrderStatus(txStatus);
  return updateOrderStatus(orderId, status);
};
