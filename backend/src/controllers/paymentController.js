// src/controllers/paymentController.js
import * as paymentService from "../services/paymentService.js";
import { AppError } from "../middlewares/errorHandler.js";

export const createPaymentToken = async (req, res, next) => {
  try {
    const snap = await paymentService.createSnapToken(req.order);
    res.json({ success: true, token: snap.token, clientKey: snap.clientKey });
  } catch (err) {
    next(err);
  }
};

export const paymentNotification = async (req, res, next) => {
  try {
    const signature = req.headers["x-midtrans-signature-key"];
    const updatedOrder = await paymentService.handlePaymentNotification(
      req.body,
      signature,
      req.user
    );
    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    next(err);
  }
};
