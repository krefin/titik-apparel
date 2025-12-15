// controllers/imageController.js
import fs from "fs/promises";
import path from "path";
import {
  compressAndSaveImage,
  generateFilename,
} from "../services/imageService.js";
// pastikan ini mengimpor service prisma Anda (bukan controller express)
import { getUserById, updateUserById } from "../services/userServices.js"; // sesuaikan path
import { getProductById, updateProduct } from "../services/productService.js";

export async function uploadImageController(req, res) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Tidak ada file yang di-upload." });
    }

    // Prioritas: gunakan req.body.userId (client), tetapi fallback ke req.user.id (auth)
    const rawUserId = req.body.userId ?? req.user?.id;
    if (!rawUserId) {
      return res.status(400).json({
        success: false,
        message: "userId wajib dikirim (atau autentikasi harus tersedia).",
      });
    }

    // Pastikan numeric; Prisma Anda meng-cast Number di service tapi baiknya validasi di sini
    const userId = Number(rawUserId);
    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "userId tidak valid.",
      });
    }

    // Jika Anda memakai auth dan ingin mencegah seseorang mengubah user lain:
    if (req.user && req.user.id && Number(req.user.id) !== userId) {
      return res.status(403).json({
        success: false,
        message: "Tidak diizinkan mengubah data user lain.",
      });
    }

    const requestedFormat = (req.body.format || "jpeg").toLowerCase();
    const ext =
      requestedFormat === "webp"
        ? "webp"
        : requestedFormat === "png"
        ? "png"
        : "jpg";
    const filename = generateFilename("upload", ext);

    // Simpan file terkompresi — compressAndSaveImage harus mengembalikan path absolut/relatif yang valid
    const result = await compressAndSaveImage(req.file.buffer, {
      filename,
      width: Number(req.body.width) || 1000,
      quality: Number(req.body.quality) || 70,
      format: requestedFormat,
    });

    const savedFilePath = result.path;

    // Optional: simpan nama file lama sebelum update untuk dapat menghapusnya setelah update berhasil
    let oldImageFilename = null;
    try {
      const existing = await getUserById(userId); // perlu import getUserById dari service jika ingin old image
      if (existing) oldImageFilename = existing.image ?? null;
    } catch (e) {
      // tidak fatal — hanya best-effort
      console.warn("Gagal membaca user lama (non-fatal):", e);
    }

    // Update user dengan image baru — jika gagal, rollback file yang baru disimpan
    try {
      await updateUserById(userId, { image: result.filename });
    } catch (updateErr) {
      console.error("Gagal update user, rollback file:", updateErr);
      await fs
        .unlink(savedFilePath)
        .catch((unlinkErr) =>
          console.error("Gagal menghapus file saat rollback:", unlinkErr)
        );

      return res.status(500).json({
        success: false,
        message: "Upload gagal: tidak dapat memperbarui data user.",
        error: updateErr.message,
      });
    }

    // Jika update sukses -> (opsional) hapus file lama user untuk mencegah orphan files
    if (oldImageFilename) {
      try {
        // sesuaikan lokasi file lama — contoh: uploads/<oldImageFilename>
        const oldPath = path.join("uploads", oldImageFilename);
        // jangan hapus jika oldImageFilename === result.filename
        if (oldPath !== savedFilePath) {
          await fs.unlink(oldPath).catch(() => {});
        }
      } catch (e) {
        // non-fatal: log saja
        console.warn("Gagal menghapus avatar lama (non-fatal):", e);
      }
    }

    return res.json({
      success: true,
      message: "Upload & kompresi berhasil",
      file: {
        filename: result.filename,
        path: result.path,
        size: result.size,
      },
    });
  } catch (err) {
    console.error("uploadImageController:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat upload",
      error: err.message,
    });
  }
}
export async function uploadImageProduct(req, res) {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId wajib dikirim (atau autentikasi harus tersedia).",
      });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Tidak ada file yang di-upload." });
    }

    const requestedFormat = (req.body.format || "jpeg").toLowerCase();
    const ext =
      requestedFormat === "webp"
        ? "webp"
        : requestedFormat === "png"
        ? "png"
        : "jpg";
    const filename = generateFilename("upload", ext);

    // Simpan file terkompresi — compressAndSaveImage harus mengembalikan path absolut/relatif yang valid
    const result = await compressAndSaveImage(req.file.buffer, {
      filename,
      width: Number(req.body.width) || 1000,
      quality: Number(req.body.quality) || 70,
      format: requestedFormat,
    });

    const savedFilePath = result.path;

    // Optional: simpan nama file lama sebelum update untuk dapat menghapusnya setelah update berhasil
    let oldImageFilename = null;
    try {
      const existing = await getProductById(productId); // perlu import getUserById dari service jika ingin old image
      if (existing) oldImageFilename = existing.image ?? null;
    } catch (e) {
      // tidak fatal — hanya best-effort
      console.warn("Gagal membaca user lama (non-fatal):", e);
    }

    // Update user dengan image baru — jika gagal, rollback file yang baru disimpan
    try {
      await updateProduct(req.params.id, { image: result.filename });
    } catch (updateErr) {
      console.error("Gagal update user, rollback file:", updateErr);
      await fs
        .unlink(savedFilePath)
        .catch((unlinkErr) =>
          console.error("Gagal menghapus file saat rollback:", unlinkErr)
        );

      return res.status(500).json({
        success: false,
        message: "Upload gagal: tidak dapat memperbarui data user.",
        error: updateErr.message,
      });
    }

    // Jika update sukses -> (opsional) hapus file lama user untuk mencegah orphan files
    if (oldImageFilename) {
      try {
        // sesuaikan lokasi file lama — contoh: uploads/<oldImageFilename>
        const oldPath = path.join("uploads", oldImageFilename);
        // jangan hapus jika oldImageFilename === result.filename
        if (oldPath !== savedFilePath) {
          await fs.unlink(oldPath).catch(() => {});
        }
      } catch (e) {
        // non-fatal: log saja
        console.warn("Gagal menghapus avatar lama (non-fatal):", e);
      }
    }

    return res.json({
      success: true,
      message: "Upload & kompresi berhasil",
      file: {
        filename: result.filename,
        path: result.path,
        size: result.size,
      },
    });
  } catch (err) {
    console.error("uploadImageController:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat upload",
      error: err.message,
    });
  }
}
