// src/controllers/authController.js
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // pastikan set di .env untuk production

// cookie options — dev-friendly. Di production gunakan secure: true & sameSite: "none".
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true di production (HTTPS)
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      city = "",
      postalCode = "",
      address = "",
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        city,
        postalCode,
        address,
      },
    });

    return res
      .status(201)
      .json({ success: true, data: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res
      .status(400)
      .json({ success: false, message: "User already exists or invalid data" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Missing credentials" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // set token sebagai cookie httpOnly
    res.cookie("token", token, cookieOptions);

    return res.json({ success: true });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const me = async (req, res) => {
  try {
    // debugging logs (bisa dihapus setelah yakin)
    // console.log(">>> Request to /api/auth/me");
    // console.log(">>> req.headers.cookie:", req.headers.cookie);
    // console.log(">>> req.cookies:", req.cookies);

    const token = req.cookies?.token;
    if (!token) {
      console.log("ME: no token present in cookies");
      return res.status(401).json({ success: false, message: "No token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (verifyErr) {
      console.log("ME: token verify failed:", verifyErr);
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

    if (!user) {
      console.log("ME: user not found for id", decoded.id);
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
