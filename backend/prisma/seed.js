// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);
  const userPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@titikapparel.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@titikapparel.com",
      password: adminPassword,
      role: "admin",
      telephone: "081122334455",
      address: "Headquarters Titik Apparel, Jl. Sudirman No. 1",
      city: "Jakarta Pusat",
      postalCode: "10110",
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: "customer@titikapparel.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@titikapparel.com",
      password: customerPassword,
      role: "customer",
      telephone: "081234567890",
      address: "Jl. Melati No. 12, RT 02/RW 05",
      city: "Jakarta Selatan",
      postalCode: "12345",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane@example.com",
      password: userPassword,
      role: "customer",
      telephone: "089876543210",
      address: "Jl. Dago No. 45",
      city: "Bandung",
      postalCode: "40135",
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: "budi@example.com" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "budi@example.com",
      password: userPassword,
      role: "customer",
      telephone: "087711223344",
      address: "Jl. Pemuda No. 88",
      city: "Surabaya",
      postalCode: "60271",
    },
  });

  console.log("👤 Users seeded successfully.");

  // 2. Seed Products
  const productData = [
    {
      name: "Oversized Heavyweight Tee - Pitch Black",
      price: 129000,
      stock: 45,
      description: "Kaos oversized berbahan 100% Heavyweight Cotton 24s. Potongan drop shoulder yang nyaman dan sangat cocok untuk gaya streetwear sehari-hari.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Vintage Washed Oversized Hoodie - Charcoal Gray",
      price: 299000,
      stock: 25,
      description: "Hoodie premium bertema vintage wash dengan bahan Cotton Fleece 330 GSM. Hangat, lembut di dalam, dan tahan lama.",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Tactical Cargo Pants - Olive Green",
      price: 249000,
      stock: 30,
      description: "Celana kargo dengan kantong multifungsi berbahan Cotton Ripstop tahan gores. Desain ergononis untuk mobilitas tinggi.",
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Minimalist Canvas Tote Bag - Natural Cream",
      price: 89000,
      stock: 60,
      description: "Tote bag kanvas tebal dengan jahitan ganda yang kuat. Dilengkapi saku dalam berkancing snap magnetik untuk laptop dan barang harian.",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Embroidery Corduroy Cap - Navy Blue",
      price: 99000,
      stock: 40,
      description: "Topi corduroy vintage dengan bordir simpel khas Titik Apparel. Gesper strap logam di bagian belakang untuk ukuran fleksibel.",
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Zip-Up Sherpa Fleece Jacket - Sand Beige",
      price: 349000,
      stock: 15,
      description: "Jaket sherpa fleece empuk dengan resleting YKK berkualitas. Menjaga suhu tubuh tetap hangat saat cuaca dingin.",
      image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Essential White Crewneck Tee",
      price: 119000,
      stock: 50,
      description: "Kaos polos putih katun combed 30s super lembut dan adem. Pilihan dasar terbaik untuk layering pakaian kamu.",
      image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Relaxed Fit Denim Trucker Jacket - Washed Blue",
      price: 399000,
      stock: 20,
      description: "Jaket denim klasik berbahan 14 oz denim non-stretch dengan efek washing autentik. Potongan rileks yang trendi sepanjang masa.",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const products = [];
  for (const data of productData) {
    const existing = await prisma.product.findFirst({ where: { name: data.name } });
    if (existing) {
      const updated = await prisma.product.update({
        where: { id: existing.id },
        data: {
          price: data.price,
          stock: data.stock,
          description: data.description,
          image: data.image,
        },
      });
      products.push(updated);
    } else {
      const created = await prisma.product.create({ data });
      products.push(created);
    }
  }

  console.log("👕 Products seeded successfully.");

  // 3. Seed Sample Orders
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    // Order 1: Lunas (Paid)
    await prisma.order.create({
      data: {
        userId: customer1.id,
        totalPrice: products[0].price + products[3].price,
        shippingCost: 20000,
        grandTotal: products[0].price + products[3].price + 20000,
        status: "paid",
        paymentMethod: "midtrans_gopay",
        courier: "jne_regular",
        recipientName: customer1.name,
        telephone: customer1.telephone,
        address: customer1.address,
        city: customer1.city,
        postalCode: customer1.postalCode,
        notes: "Tolong bungkus yang rapi ya",
        items: {
          create: [
            {
              productId: products[0].id,
              productName: products[0].name,
              price: products[0].price,
              quantity: 1,
            },
            {
              productId: products[3].id,
              productName: products[3].name,
              price: products[3].price,
              quantity: 1,
            },
          ],
        },
      },
    });

    // Order 2: Dikirim (Shipped)
    await prisma.order.create({
      data: {
        userId: customer2.id,
        totalPrice: products[1].price,
        shippingCost: 25000,
        grandTotal: products[1].price + 25000,
        status: "shipped",
        paymentMethod: "midtrans_bank_transfer",
        courier: "sicepat_best",
        recipientName: customer2.name,
        telephone: customer2.telephone,
        address: customer2.address,
        city: customer2.city,
        postalCode: customer2.postalCode,
        notes: "Kirim sebelum jam 5 sore",
        items: {
          create: [
            {
              productId: products[1].id,
              productName: products[1].name,
              price: products[1].price,
              quantity: 1,
            },
          ],
        },
      },
    });

    // Order 3: Menunggu Pembayaran (Pending)
    await prisma.order.create({
      data: {
        userId: customer3.id,
        totalPrice: products[2].price,
        shippingCost: 30000,
        grandTotal: products[2].price + 30000,
        status: "pending",
        paymentMethod: "midtrans_qris",
        courier: "jnt_express",
        recipientName: customer3.name,
        telephone: customer3.telephone,
        address: customer3.address,
        city: customer3.city,
        postalCode: customer3.postalCode,
        items: {
          create: [
            {
              productId: products[2].id,
              productName: products[2].name,
              price: products[2].price,
              quantity: 1,
            },
          ],
        },
      },
    });

    // Order 4: Dibatalkan (Cancelled)
    await prisma.order.create({
      data: {
        userId: customer1.id,
        totalPrice: products[4].price,
        shippingCost: 20000,
        grandTotal: products[4].price + 20000,
        status: "cancelled",
        paymentMethod: "midtrans_credit_card",
        courier: "jne_regular",
        recipientName: customer1.name,
        telephone: customer1.telephone,
        address: customer1.address,
        city: customer1.city,
        postalCode: customer1.postalCode,
        items: {
          create: [
            {
              productId: products[4].id,
              productName: products[4].name,
              price: products[4].price,
              quantity: 1,
            },
          ],
        },
      },
    });

    console.log("📦 Sample Orders seeded successfully.");
  }

  // 4. Seed Cart items for customer1
  let userCart = await prisma.cart.findUnique({ where: { userId: customer1.id } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId: customer1.id } });
  }

  const existingCartItems = await prisma.cartItem.count({ where: { cartId: userCart.id } });
  if (existingCartItems === 0) {
    await prisma.cartItem.createMany({
      data: [
        { cartId: userCart.id, productId: products[0].id, quantity: 2 },
        { cartId: userCart.id, productId: products[4].id, quantity: 1 },
      ],
    });
    console.log("🛒 Cart items seeded successfully.");
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
