// src/utils/validators.js
import { z } from "zod";

// ---------- Auth ----------
export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  telephone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100),
});

// ---------- Admin: buat user (role boleh dipilih oleh admin saja) ----------
export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  role: z.enum(["admin", "customer"]).default("customer"),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  telephone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100)
    .optional(),
  telephone: z.string().trim().max(20).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  postalCode: z.string().trim().max(10).nullable().optional(),
  address: z.string().trim().max(255).nullable().optional(),
  role: z.enum(["admin", "customer"]).optional(),
});

// ---------- Product ----------
const priceSchema = z.number().int("Price must be integer").min(0);
const stockSchema = z.number().int("Stock must be integer").min(0);

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  price: priceSchema,
  stock: stockSchema,
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  image: z.string().trim().max(500).optional().or(z.literal("")),
});

export const productUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  price: priceSchema.optional(),
  stock: stockSchema.optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  image: z.string().trim().max(500).nullable().optional(),
});

// ---------- Order ----------
export const orderItemSchema = z.object({
  productId: z.number().int("productId must be integer").positive(),
  quantity: z.number().int("quantity must be integer").min(1).max(999),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must contain at least 1 item"),
  courier: z.string().trim().max(50).optional().or(z.literal("")),
  paymentMethod: z
    .enum(["va", "card", "cod"])
    .optional()
    .or(z.literal("")),
  recipientName: z.string().trim().max(100).optional().or(z.literal("")),
  telephone: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  // harga dari client DIABAIKAN; server memakai harga di DB
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "settlement",
    "processing",
    "process",
    "shipped",
    "shipping",
    "completed",
    "done",
    "failed",
    "cancelled",
    "canceled",
  ]),
});

// ---------- Cart ----------
export const cartAddSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999).optional(),
});

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(1).max(999),
});

// ---------- Payment ----------
export const paymentTokenSchema = z.object({
  orderId: z.number().int().positive(),
});

export const paymentNotificationSchema = z.object({
  order_id: z.string().or(z.number()).optional(),
  orderId: z.string().or(z.number()).optional(),
  transaction_status: z.string().optional(),
  transactionStatus: z.string().optional(),
  status: z.string().optional(),
  status_code: z.union([z.string(), z.number()]).optional(),
  statusCode: z.union([z.string(), z.number()]).optional(),
  gross_amount: z.union([z.string(), z.number()]).optional(),
});

// ---------- Kontak ----------
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

// ---------- Query params ----------
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(9),
  search: z.string().trim().max(100).optional().or(z.literal("")),
  sort: z.string().trim().max(30).optional().or(z.literal("")),
});
