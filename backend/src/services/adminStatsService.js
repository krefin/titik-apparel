import prisma from "../lib/prisma.js";

// Total stats
export const getTotalStats = async () => {
  const totalOrders = await prisma.order.count();

  const paidOrders = await prisma.order.count({
    where: { status: "paid" },
  });

  const revenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: "paid" },
  });

  const productsSold = await prisma.order.aggregate({
    _sum: { quantity: true },
    where: { status: "paid" },
  });

  return {
    totalOrders,
    paidOrders,
    revenue: revenue._sum.total || 0,
    productsSold: productsSold._sum.quantity || 0,
  };
};

// Statistik bulanan
export const getMonthlySalesStats = async () => {
  const sales = await prisma.$queryRaw`
    SELECT 
      DATE_FORMAT("createdAt", '%Y-%m') as month,
      COUNT(*) as totalOrders,
      SUM(total) as revenue
    FROM "Order"
    WHERE status = 'paid'
    GROUP BY DATE_FORMAT("createdAt", '%Y-%m')
    ORDER BY month ASC;
  `;
  return sales;
};
