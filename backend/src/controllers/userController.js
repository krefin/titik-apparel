import * as userServices from "../services/userServices.js";
import { AppError } from "../middlewares/errorHandler.js";

export const getUserById = async (req, res, next) => {
  try {
    // Admin boleh akses semua; non-admin hanya profilnya sendiri
    if (req.user.role !== "admin" && Number(req.params.id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak berhak melihat user lain",
      });
    }

    const user = await userServices.getUserById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    const isSelf = targetId === req.user.id;
    const isAdminUser = req.user.role === "admin";

    if (!isAdminUser && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "Anda hanya dapat memperbarui profil sendiri",
      });
    }

    // Non-admin tidak boleh mengubah role / email orang lain
    const body = { ...req.body };
    if (!isAdminUser) {
      delete body.role;
      delete body.email;
    }

    const updatedUser = await userServices.updateUserById(targetId, body);
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await userServices.getAllUsers({ page, limit, search });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userServices.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Email sudah terdaftar" });
    }
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
      return res
        .status(400)
        .json({ success: false, message: "Tidak bisa menghapus akun sendiri" });
    }
    await userServices.deleteUser(targetId);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
