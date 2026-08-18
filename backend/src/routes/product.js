import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  productCreateSchema,
  productUpdateSchema,
} from "../utils/validators.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  authMiddleware,
  isAdmin,
  validate(productCreateSchema),
  createProduct
);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  validate(productUpdateSchema),
  updateProduct
);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

export default router;
