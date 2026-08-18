import { Router } from "express";
import {
  authMiddleware,
  isAdmin,
} from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  createUser,
  deleteUser,
} from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import {
  adminCreateUserSchema,
  userUpdateSchema,
} from "../utils/validators.js";

const router = Router();

router.get("/", authMiddleware, isAdmin, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.post(
  "/",
  authMiddleware,
  isAdmin,
  validate(adminCreateUserSchema),
  createUser
);
router.put(
  "/:id",
  authMiddleware,
  validate(userUpdateSchema),
  updateUserById
);
router.delete("/:id", authMiddleware, isAdmin, deleteUser);

export default router;
