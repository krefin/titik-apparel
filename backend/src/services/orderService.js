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
