// src/controllers/orderController.js
import * as orderService from "../services/orderService.js";

// Buat order baru
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id; // diasumsikan authMiddleware sudah set req.user
    const items = req.body.items; // [{ productId, quantity, price }]
    const order = await orderService.createOrder({ userId, items });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// Ambil semua order milik user
export const getOrdersByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getOrdersByUser(userId);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// Ambil detail order by id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// Update status order (misal admin / payment webhook)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
