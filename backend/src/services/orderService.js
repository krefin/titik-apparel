// src/services/orderService.js
import prisma from "../lib/prisma.js";
import { AppError } from "../middlewares/errorHandler.js";
import { emitNewOrderNotification, emitOrderStatusUpdate, emitStockUpdate } from "../lib/socket.js";

// Tarif ongkir ditentukan SERVER (tidak boleh dari client)
export const SHIPPING_RATES = {
  jne: 20000,
  pos: 18000,
  tiki: 22000,
};

const getShippingCost = (courier = "") => {
  const key = courier.toLowerCase().split(/[_-]/)[0];
  return SHIPPING_RATES[key] ?? 0;
};

export const createOrder = async ({
  userId,
  items,
  courier = "",
  paymentMethod = "",
  recipientName = "",
  telephone = "",
  address = "",
  city = "",
  postalCode = "",
  notes = "",
}) => {
  if (!items || items.length === 0) {
    throw new AppError(400, "Order harus memiliki minimal 1 item");
  }

  // Harga & stok diambil dari DATABASE (harga dari client diabaikan)
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validasi stok & hitung subtotal
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new AppError(404, `Produk dengan id ${item.productId} tidak ditemukan`);
    }
    if (item.quantity > product.stock) {
      throw new AppError(
        400,
        `Stok produk "${product.name}" tidak cukup (tersisa ${product.stock})`
      );
    }
    orderItems.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
    });
    subtotal += product.price * item.quantity;
  }

  const shippingCost = getShippingCost(courier);
  const grandTotal = subtotal + shippingCost;

  // Semua operasi dalam satu transaksi (order + items + pengurangan stok)
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        totalPrice: subtotal,
        shippingCost,
        grandTotal,
        status: "pending",
        paymentMethod: paymentMethod || null,
        courier: courier || null,
        recipientName: recipientName || null,
        telephone: telephone || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        notes: notes || null,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Kurangi stok atomik & kumpulkan stok baru
    for (const item of orderItems) {
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      // Broadcast real-time stock update
      emitStockUpdate(updatedProduct.id, updatedProduct.stock);
    }

    return created;
  });

  // Emit WebSocket events
  emitNewOrderNotification(order);
  emitOrderStatusUpdate(userId, order);

  return order;
};

// Kembalikan stok saat order dibatalkan/gagal
export const restoreStock = async (orderId, tx = prisma) => {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    const updated = await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
    emitStockUpdate(updated.id, updated.stock);
  }
};

export const getOrdersByUser = async (userId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const where = { userId: Number(userId) };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: { items: { include: { product: true } } },
      orderBy: { id: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page, limit };
};

export const getOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { product: true } }, user: true },
  });
};

export const updateOrderStatus = async (id, status) => {
  const existing = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError(404, "Order not found");

  const cancelledLike = ["cancelled", "canceled", "failed"];
  const wasActive = !cancelledLike.includes(existing.status);
  const nowInactive = cancelledLike.includes(status);

  let updatedOrder;
  // Jika order berubah jadi batal/gagal, kembalikan stok (hanya jika sebelumnya aktif)
  if (wasActive && nowInactive) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: Number(id) }, data: { status } });
      await restoreStock(Number(id), tx);
    });
    updatedOrder = await prisma.order.findUnique({ where: { id: Number(id) } });
  } else {
    updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });
  }

  // Emit real-time status update to user & admin
  emitOrderStatusUpdate(existing.userId, updatedOrder);

  return updatedOrder;
};

export const getAllOrders = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const skip = (page - 1) * limit;
  const s = search.trim().toLowerCase();

  const conditions = [];

  if (s && !isNaN(Number(s))) {
    conditions.push({ id: Number(s) });
    conditions.push({ userId: Number(s) });
  }

  if (
    [
      "paid",
      "settlement",
      "pending",
      "cancelled",
      "canceled",
      "failed",
      "shipped",
      "shipping",
      "processing",
      "process",
      "completed",
      "done",
    ].includes(s)
  ) {
    conditions.push({ status: s });
  }

  const where = s && conditions.length > 0 ? { OR: conditions } : {};

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { id: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page, limit };
};
