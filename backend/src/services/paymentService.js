// src/services/paymentService.js
import snap from "../lib/midtrans.js";
import { updateOrderStatus } from "./orderService.js";

export const createSnapToken = async (order) => {
  const parameter = {
    transaction_details: {
      order_id: order.id.toString(),
      gross_amount: order.totalPrice,
    },
    credit_card: { secure: true },
    customer_details: {
      first_name: order.user.name,
      email: order.user.email,
    },
  };

  const snapResponse = await snap.createTransaction(parameter);
  return snapResponse;
};

export const handlePaymentNotification = async (notification) => {
  const { order_id, transaction_status } = notification;

  let status = "pending";
  if (transaction_status === "capture" || transaction_status === "settlement") {
    status = "paid";
  } else if (
    transaction_status === "deny" ||
    transaction_status === "cancel" ||
    transaction_status === "expire"
  ) {
    status = "failed";
  }

  const updatedOrder = await updateOrderStatus(Number(order_id), status);
  return updatedOrder;
};
