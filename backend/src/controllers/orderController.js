// src/controllers/orderController.js
import * as orderService from "../services/orderService.js";

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      items,
      courier,
      paymentMethod,
      recipientName,
      telephone,
      address,
      city,
      postalCode,
      notes,
    } = req.body;

    const order = await orderService.createOrder({
      userId,
      items,
      courier,
      paymentMethod,
      recipientName,
      telephone,
      address,
      city,
      postalCode,
      notes,
    });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const search = req.query.search || "";

    const orders = await orderService.getAllOrders({ page, limit, search });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrdersByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const orders = await orderService.getOrdersByUser(userId, { page, limit });
    res.json({ success: true, ...orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // Pemilik order atau admin
    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Order ini bukan milik Anda" });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
