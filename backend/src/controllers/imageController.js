// controllers/imageController.js
import fs from "fs/promises";
import path from "path";
import {
  compressAndSaveImage,
  generateFilename,
} from "../services/imageService.js";
import { getUserById, updateUserById } from "../services/userServices.js";
import { getProductById, updateProduct } from "../services/productService.js";
import { AppError } from "../middlewares/errorHandler.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const parseFormat = (format = "jpeg") => {
  const f = format.toLowerCase();
  if (f === "webp" || f === "png" || f === "jpeg" || f === "jpg") return f;
  return "jpeg";
};

const toExt = (format) => (format === "webp" ? "webp" : format === "png" ? "png" : "jpg");

const clampInt = (value, min, max, fallback) => {
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

const removeOldFile = async (filename, newPath) => {
  if (!filename) return;
  const oldPath = path.join(UPLOAD_DIR, filename);
  if (oldPath !== newPath) {
    await fs.unlink(oldPath).catch(() => {});
  }
};

async function handleUpload(req, res, next, { targetKind }) {
  try {
    if (!req.file) {
      throw new AppError(400, "Tidak ada file yang di-upload.");
    }

    const format = parseFormat(req.body.format);
    const filename = generateFilename("upload", toExt(format));
    const result = await compressAndSaveImage(req.file.buffer, {
      filename,
      width: clampInt(req.body.width, 100, 2000, 1000),
      quality: clampInt(req.body.quality, 1, 100, 70),
      format,
    });

    const savedFilePath = result.path;

    if (targetKind === "user") {
      const userId = req.user.id;
      const existing = await getUserById(userId);
      if (!existing) {
        await fs.unlink(savedFilePath).catch(() => {});
        throw new AppError(404, "User not found");
      }
      const oldImage = existing.image ?? null;

      try {
        await updateUserById(userId, { image: result.filename });
      } catch (updateErr) {
        await fs.unlink(savedFilePath).catch(() => {});
        throw updateErr;
      }

      await removeOldFile(oldImage, savedFilePath);

      return res.json({
        success: true,
        message: "Upload berhasil",
        file: { filename: result.filename, path: result.path, size: result.size },
      });
    }

    // targetKind === "product"
    const productId = req.params.id;
    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      await fs.unlink(savedFilePath).catch(() => {});
      throw new AppError(404, "Product not found");
    }
    const oldImage = existingProduct.image ?? null;

    try {
      await updateProduct(productId, { image: result.filename });
    } catch (updateErr) {
      await fs.unlink(savedFilePath).catch(() => {});
      throw updateErr;
    }

    await removeOldFile(oldImage, savedFilePath);

    return res.json({
      success: true,
      message: "Upload berhasil",
      file: { filename: result.filename, path: result.path, size: result.size },
    });
  } catch (err) {
    next(err);
  }
}

export const uploadImageController = (req, res, next) =>
  handleUpload(req, res, next, { targetKind: "user" });

export const uploadImageProduct = (req, res, next) =>
  handleUpload(req, res, next, { targetKind: "product" });
