import express from "express";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addItem);
router.patch("/:itemId", authMiddleware, updateItem);
router.delete("/:itemId", authMiddleware, removeItem);
router.delete("/", authMiddleware, clearCart);

export default router;
