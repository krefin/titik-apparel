// src/routes/auth.js
import express from "express";
import {
  register,
  login,
  logout,
  me,
  changePassword,
} from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../utils/validators.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", me);
router.put(
  "/password",
  authMiddleware,
  validate(changePasswordSchema),
  changePassword
);

export default router;
