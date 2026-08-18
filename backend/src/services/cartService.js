import prisma from "../lib/prisma.js";
import { AppError } from "../middlewares/errorHandler.js";
import { emitCartUpdate } from "../lib/socket.js";

export const getUserCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, "Product not found");
  if (product.stock <= 0) throw new AppError(400, "Produk sedang kosong");

  const cart = await getUserCart(userId);

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  const newQty = existingItem ? existingItem.quantity + quantity : quantity;
  if (newQty > product.stock) {
    throw new AppError(400, `Stok produk "${product.name}" hanya ${product.stock}`);
  }

  let result;
  if (existingItem) {
    result = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
      include: { product: true },
    });
  } else {
    result = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
      include: { product: true },
    });
  }

  // Trigger WebSocket real-time update
  emitCartUpdate(userId);

  return result;
};

export const updateCartItem = async (userId, itemId, quantity) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item) throw new AppError(404, "Item tidak ditemukan");
  if (item.cart.userId !== userId) {
    throw new AppError(403, "Item ini bukan milik Anda");
  }

  const product = await prisma.product.findUnique({ where: { id: item.productId } });
  if (product && quantity > product.stock) {
    throw new AppError(400, `Stok produk hanya ${product.stock}`);
  }

  const result = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: true },
  });

  // Trigger WebSocket real-time update
  emitCartUpdate(userId);

  return result;
};

export const removeCartItem = async (userId, itemId) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item) throw new AppError(404, "Item tidak ditemukan");
  if (item.cart.userId !== userId) {
    throw new AppError(403, "Item ini bukan milik Anda");
  }

  const result = await prisma.cartItem.delete({ where: { id: itemId } });

  // Trigger WebSocket real-time update
  emitCartUpdate(userId);

  return result;
};

export const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  const result = await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  // Trigger WebSocket real-time update
  emitCartUpdate(userId);

  return result;
};
