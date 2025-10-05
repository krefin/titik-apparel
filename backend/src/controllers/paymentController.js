// src/controllers/paymentController.js
import * as paymentService from "../services/paymentService.js";

export const createPaymentToken = async (req, res, next) => {
  try {
    const snap = await paymentService.createSnapToken(req.order);
    res.json({ success: true, token: snap.token });
  } catch (err) {
    next(err);
  }
};

export const paymentNotification = async (req, res, next) => {
  try {
    const updatedOrder = await paymentService.handlePaymentNotification(
      req.body
    );
    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    next(err);
  }
};
