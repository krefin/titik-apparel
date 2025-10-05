import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  // pastikan headers ada
  const authHeader = req.headers?.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // format: Bearer <token>
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Malformed token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

export function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }
  next();
}
