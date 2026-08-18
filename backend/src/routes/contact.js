import express from "express";
import { submitContact } from "../controllers/contactController.js";
import { validate } from "../middlewares/validate.js";
import { contactSchema } from "../utils/validators.js";
import { apiLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/", apiLimiter, validate(contactSchema), submitContact);

export default router;
