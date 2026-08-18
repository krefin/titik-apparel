// routes/image.js
import express from "express";
import { uploadSingleImage } from "../middlewares/upload.js";
import {
  uploadImageController,
  uploadImageProduct,
} from "../controllers/imageController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { uploadLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

const withUpload = (handler) => (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

/**
 * POST /api/images/upload  — upload avatar user (wajib login, hanya avatar sendiri)
 * Form-data: image, format?, width?, quality?
 */
router.post(
  "/upload",
  authMiddleware,
  uploadLimiter,
  withUpload(),
  uploadImageController
);

/**
 * POST /api/images/upload/product/:id — upload gambar produk (khusus admin)
 */
router.post(
  "/upload/product/:id",
  authMiddleware,
  isAdmin,
  uploadLimiter,
  withUpload(),
  uploadImageProduct
);

export default router;
