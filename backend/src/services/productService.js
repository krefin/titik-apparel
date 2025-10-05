// src/services/productService.js
import prisma from "../lib/prisma.js";

export const getAllProducts = async () => {
  return prisma.product.findMany();
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
