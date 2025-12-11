// services/imageService.js
import fs from "fs";
import path from "path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// pastikan folder ada
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * compressAndSaveImage
 * - buffer: Buffer dari multer memoryStorage
 * - options: { filename, width, quality, format }
 * Returns: object { path, size, filename }
 */
export async function compressAndSaveImage(buffer, options = {}) {
  const {
    filename = `img-${Date.now()}.jpg`,
    width = 1000, // max width
    quality = 70, // quality untuk jpeg/webp
    format = "jpeg", // jpeg | webp | png
  } = options;

  const outputPath = path.join(UPLOAD_DIR, filename);

  let pipeline = sharp(buffer).rotate(); // rotate based on EXIF

  // resize hanya jika width diberikan dan lebih kecil
  if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });

  // output sesuai format
  if (format === "webp") {
    pipeline = pipeline.webp({ quality });
  } else if (format === "png") {
    // PNG lossless — dapat gunakan compressionLevel
    pipeline = pipeline.png({ compressionLevel: 8 });
  } else {
    pipeline = pipeline.jpeg({ quality });
  }

  await pipeline.toFile(outputPath);

  const stats = fs.statSync(outputPath);
  return {
    filename,
    path: outputPath,
    size: stats.size,
  };
}

/**
 * generateFilename
 * - memberi ekstensi sesuai format
 */
export function generateFilename(base = "img", ext = "jpg") {
  return `${base}-${Date.now()}.${ext.replace(/^\./, "")}`;
}
