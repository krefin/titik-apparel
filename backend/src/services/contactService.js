import prisma from "../lib/prisma.js";

export const createContactMessage = async (data) => {
  return prisma.contactMessage.create({ data });
};
