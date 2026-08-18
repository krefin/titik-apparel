import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

// Proyeksi aman: TIDAK PERNAH mengembalikan password
export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  telephone: true,
  address: true,
  city: true,
  postalCode: true,
  image: true,
  createdAt: true,
  updatedAt: true,
};

export const getAllUsers = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [{ name: { contains: search } }, { email: { contains: search } }],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: safeUserSelect,
      orderBy: { id: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: safeUserSelect,
  });
};

export const updateUserById = async (id, data) => {
  const { id: _id, ...rest } = data ?? {};
  const updateData = { ...rest };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
    select: safeUserSelect,
  });
};

export const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { ...data, password: hashedPassword },
    select: safeUserSelect,
  });
};

export const deleteUser = async (id) => {
  return prisma.user.delete({ where: { id: Number(id) } });
};
