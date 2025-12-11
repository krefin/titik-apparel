import prisma from "../lib/prisma.js";

export const getAllUsers = async () => {
  return prisma.user.findMany();
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id: Number(id) },
  });
};
export const updateUserById = async (id, data) => {
  return prisma.user.update({
    where: { id: Number(id) },
    data,
  });
};
