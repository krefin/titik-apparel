// src/services/productService.js
import prisma from "../lib/prisma.js";

export const getAllProducts = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        name: {
          contains: search,
        },
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { data, total };
};

export const getProductById = async (id) => {
  return prisma.product.findUnique({ where: { id: Number(id) } });
};

export const createProduct = async (data) => {
  return prisma.product.create({ data });
};

export const updateProduct = async (id, data) => {
  return prisma.product.update({ where: { id: Number(id) }, data });
};

export const deleteProduct = async (id) => {
  return prisma.product.delete({ where: { id: Number(id) } });
};
