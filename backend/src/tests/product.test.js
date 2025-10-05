// tests/product.test.js
import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

let token;
let productId;

beforeAll(async () => {
  // 1️⃣ Login user admin untuk dapat token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@titikapparel.com", password: "admin123" });

  token = res.body.token;
  if (!token) throw new Error("Login gagal: token tidak ditemukan");

  // 2️⃣ Buat product dummy khusus test
  const product = await prisma.product.create({
    data: {
      name: "Test Product",
      price: 10000,
      stock: 10,
    },
  });
  productId = product.id;
});

afterAll(async () => {
  // Hapus product dummy test
  await prisma.product.delete({ where: { id: productId } });
  await prisma.$disconnect();
});

describe("Product Routes", () => {
  it("should create a product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New Product",
        price: 5000,
        stock: 5,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Product");
  });

  it("should get product by id", async () => {
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(productId);
  });

  it("should update a product", async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ stock: 20 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stock).toBe(20);
  });

  it("should delete a product", async () => {
    // Buat product baru untuk dihapus
    const tempProduct = await prisma.product.create({
      data: { name: "Temp Delete", price: 1000, stock: 1 },
    });

    const res = await request(app)
      .delete(`/api/products/${tempProduct.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product deleted");
  });
});
