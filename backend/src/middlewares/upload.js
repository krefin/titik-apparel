// middlewares/upload.js
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB max per file, sesuaikan jika perlu
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar"), false);
    }
    cb(null, true);
  },
}).single("image"); // field name dari form-data: "image"
