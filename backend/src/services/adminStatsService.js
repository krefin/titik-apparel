import prisma from "../lib/prisma.js";

export const getTotalStats = async () => {
  const totalOrders = await prisma.order.count();
  const totalProducts = await prisma.product.count();
  const totalUsers = await prisma.user.count();

  const paidOrders = await prisma.order.count({
    where: { status: "paid" },
  });

  const revenueAgg = await prisma.order.aggregate({
    _sum: { grandTotal: true },
    where: { status: "paid" },
  });

  const productsSoldAgg = await prisma.orderItem.aggregate({
    _sum: { quantity: true },
    where: { order: { status: "paid" } },
  });

  return {
    totalOrders,
    totalProducts,
    totalUsers,
    paidOrders,
    revenue: revenueAgg._sum.grandTotal || 0,
    productsSold: productsSoldAgg._sum.quantity || 0,
  };
};

// Penjualan per bulan (grup dalam JS agar kompatibel semua DB)
export const getMonthlySalesStats = async () => {
  const orders = await prisma.order.findMany({
    where: { status: "paid" },
    select: { createdAt: true, grandTotal: true, totalPrice: true },
    orderBy: { createdAt: "asc" },
  });

  const byMonth = new Map();

  for (const order of orders) {
    const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
    const revenue = order.grandTotal || order.totalPrice || 0;
    const current = byMonth.get(month) || { month, totalOrders: 0, revenue: 0 };
    current.totalOrders += 1;
    current.revenue += revenue;
    byMonth.set(month, current);
  }

  return Array.from(byMonth.values());
};
