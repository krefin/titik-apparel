// src/controllers/authController.js
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";

// cookie options — secure di production (HTTPS)
const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, city = "", postalCode = "", address = "", telephone = "" } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // role SELALU "customer" — tidak bisa dipilih lewat register
        role: "customer",
        city,
        postalCode,
        address,
        telephone,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Email sudah terdaftar" });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });

    const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie("token", token, cookieOptions);

    return res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ success: true, message: "Logged out successfully" });
};

export const me = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "No token" });

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        city: true,
        telephone: true,
        postalCode: true,
        image: true,
      },
    });

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Password saat ini salah" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.json({ success: true, message: "Password berhasil diubah" });
  } catch (err) {
    next(err);
  }
};
