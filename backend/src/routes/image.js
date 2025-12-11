// routes/image.js
import express from "express";
import { uploadSingleImage } from "../middlewares/upload.js";
import { uploadImageController } from "../controllers/imageController.js";

const router = express.Router();

/**
 * POST /api/images/upload
 * Form-data:
 *  - image: file
 *  - format (optional): jpeg|webp|png
 *  - width (optional): number
 *  - quality (optional): number 1-100
 */
router.post(
  "/upload",
  (req, res, next) => {
    // gunakan uploadSingleImage sebagai middleware manual agar error multer bisa ditangani
    uploadSingleImage(req, res, (err) => {
      if (err) {
        // multer error -> kirim response yang jelas
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadImageController
);

export default router;
