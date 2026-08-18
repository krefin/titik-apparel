// src/middlewares/errorHandler.js
import multer from "multer";
import { Prisma } from "@prisma/client";
import { env } from "../lib/env.js";

export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(`[error] ${req.method} ${req.originalUrl}`, err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Kesalahan unik / not found / dll
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Data already exists";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else {
      statusCode = 400;
      message = "Database error";
    }
  }

  if (statusCode === 500 && env?.isProduction) {
    message = "Internal Server Error";
  }

  return res.status(statusCode).json({ success: false, message });
};
