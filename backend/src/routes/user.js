import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserById,
} from "../controllers/userController.js";

const router = Router();

router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUserById);

export default router;
