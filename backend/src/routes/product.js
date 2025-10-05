import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js"; // sesuaikan nama

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts); // sebelumnya getProducts
router.get("/:id", getProductById);
router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct); // hapus endpoint delete

export default router;
