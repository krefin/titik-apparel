// src/services/orderService.js
import prisma from "../lib/prisma.js";

export const createOrder = async ({ userId, items }) => {
  // Hitung total price
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Buat order
  const order = await prisma.order.create({
    data: {
      userId,
      totalPrice,
      status: "pending",
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });

  return order;
};

export const getOrdersByUser = async (userId) => {
  return prisma.order.findMany({
    where: { userId: Number(userId) },
    include: { items: { include: { product: true } } },
  });
};

export const getOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { product: true } }, user: true },
  });
};

export const updateOrderStatus = async (id, status) => {
  return prisma.order.update({
    where: { id: Number(id) },
    data: { status },
  });
};

export const getAllOrders = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const skip = (page - 1) * limit;
  const s = search.trim().toLowerCase();

  const conditions = [];

  // search numeric → id / userId
  if (s && !isNaN(Number(s))) {
    conditions.push({ id: Number(s) });
    conditions.push({ userId: Number(s) });
  }

  // search status enum
  if (["paid", "pending", "cancelled"].includes(s)) {
    conditions.push({ status: s });
  }

  /**
   * LOGIKA UTAMA:
   * - search kosong → where = {}
   * - search ada & conditions ada → OR
   * - search ada tapi tidak valid → where = {}
   */
  const where = s && conditions.length > 0 ? { OR: conditions } : {};

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total };
};
