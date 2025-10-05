// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // Buat admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@titikapparel.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@titikapparel.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  // Buat customer user
  const customer = await prisma.user.upsert({
    where: { email: "customer@titikapparel.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@titikapparel.com",
      password: await bcrypt.hash("customer123", 10),
      role: "customer",
    },
  });

  // Tambahkan produk sample
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Basic Black T-Shirt",
        price: 99000,
        stock: 50,
      },
      {
        name: "Classic Hoodie",
        price: 199000,
        stock: 30,
      },
      {
        name: "Street Cap",
        price: 75000,
        stock: 20,
      },
    ],
    skipDuplicates: true,
  });

  // Buat order sample untuk customer
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      totalPrice: 99000,
      status: "paid",
      items: {
        create: [
          {
            productId: 1, // Basic Black T-Shirt
            quantity: 1,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log("✅ Seeding done!");
  console.log({ admin, customer, products, order });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
