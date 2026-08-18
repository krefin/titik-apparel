import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";

export function authMiddleware(req, res, next) {
  const tokenFromCookie = req.cookies?.token;

  const authHeader = req.headers?.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

export function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Admin only" });
  }
  next();
}

export function optionalAuthMiddleware(req, res, next) {
  const tokenFromCookie = req.cookies?.token;

  const authHeader = req.headers?.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      req.user = decoded;
    } catch {
      /* ignore invalid token if optional */
    }
  }
  next();
}
