import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { validate } from "../middlewares/validate.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../utils/validators.js";

const router = express.Router();

router.post("/", authMiddleware, validate(createOrderSchema), createOrder);
router.get("/all", authMiddleware, isAdmin, getAllOrders);
router.get("/", authMiddleware, getOrdersByUser);
router.get("/:id", authMiddleware, getOrderById);
router.put(
  "/:id/status",
  authMiddleware,
  isAdmin,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
