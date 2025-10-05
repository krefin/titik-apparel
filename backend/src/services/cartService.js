import prisma from "../lib/prisma.js";

export const getUserCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  // Kalau belum ada cart, buat baru
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  return cart;
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const cart = await getUserCart(userId);

  // Cek apakah produk sudah ada di cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity },
  });
};

export const updateCartItem = async (itemId, quantity) => {
  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
};

export const removeCartItem = async (itemId) => {
  return prisma.cartItem.delete({ where: { id: itemId } });
};

export const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  return prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};
