import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const adminAgent = request.agent(app);

let createdId = null;

beforeAll(async () => {
  const res = await adminAgent.post("/api/auth/login").send({
    email: "admin@titikapparel.com",
    password: "admin123",
  });
  expect(res.statusCode).toBe(200);
});

afterAll(async () => {
  if (createdId) {
    await prisma.product.delete({ where: { id: createdId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe("Product Routes", () => {
  it("should reject create without auth", async () => {
    const res = await request(app).post("/api/products").send({
      name: "No Auth",
      price: 100,
      stock: 1,
    });
    expect(res.statusCode).toBe(401);
  });

  it("should reject customer role", async () => {
    const customer = request.agent(app);
    await customer.post("/api/auth/login").send({
      email: "customer@titikapparel.com",
      password: "customer123",
    });
    const res = await customer.post("/api/products").send({
      name: "Not Admin",
      price: 100,
      stock: 1,
    });
    expect(res.statusCode).toBe(403);
  });

  it("should validate product data", async () => {
    const res = await adminAgent.post("/api/products").send({
      name: "",
      price: -5,
      stock: -1,
    });
    expect(res.statusCode).toBe(400);
  });

  it("should create a product (admin)", async () => {
    const res = await adminAgent.post("/api/products").send({
      name: "Test Product",
      price: 5000,
      stock: 5,
      description: "Produk untuk test",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Test Product");
    createdId = res.body.data.id;
  });

  it("should get product by id", async () => {
    const res = await request(app).get(`/api/products/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdId);
  });

  it("should update a product", async () => {
    const res = await adminAgent
      .put(`/api/products/${createdId}`)
      .send({ stock: 20, price: 6000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.stock).toBe(20);
    expect(res.body.data.price).toBe(6000);
  });

  it("should support pagination & sort", async () => {
    const res = await request(app).get(
      "/api/products?page=1&limit=5&sort=price_desc"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it("should delete a product (admin)", async () => {
    const res = await adminAgent.delete(`/api/products/${createdId}`);
    expect(res.statusCode).toBe(200);
    createdId = null;
  });
});
