import express from "express";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { cartAddSchema, cartUpdateSchema } from "../utils/validators.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, validate(cartAddSchema), addItem);
router.put("/:itemId", authMiddleware, validate(cartUpdateSchema), updateItem);
router.delete("/:itemId", authMiddleware, removeItem);
router.delete("/", authMiddleware, clearCart);

export default router;
