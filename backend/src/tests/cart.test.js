import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const userAgent = request.agent(app);
let productId;
let productStock;

beforeAll(async () => {
  const res = await userAgent.post("/api/auth/login").send({
    email: "customer@titikapparel.com",
    password: "customer123",
  });
  expect(res.statusCode).toBe(200);

  // mulai dari cart bersih agar test isolasi
  await userAgent.delete("/api/cart").catch(() => {});

  const products = await request(app).get("/api/products?limit=1");
  productId = products.body.data[0].id;
  productStock = products.body.data[0].stock;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Cart Routes", () => {
  it("should add item to cart", async () => {
    const qty = Math.min(2, productStock);
    const res = await userAgent
      .post("/api/cart")
      .send({ productId, quantity: qty });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should reject add with invalid quantity", async () => {
    const res = await userAgent
      .post("/api/cart")
      .send({ productId, quantity: 0 });
    expect(res.statusCode).toBe(400);
  });

  it("should reject adding non-existent product", async () => {
    const res = await userAgent
      .post("/api/cart")
      .send({ productId: 999999, quantity: 1 });
    expect(res.statusCode).toBe(404);
  });

  it("should get user cart", async () => {
    const res = await userAgent.get("/api/cart");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it("should update cart item quantity", async () => {
    const cart = await userAgent.get("/api/cart");
    const itemId = cart.body.data.items[0].id;
    const targetQty = Math.max(1, Math.min(3, productStock));

    const res = await userAgent
      .put(`/api/cart/${itemId}`)
      .send({ quantity: targetQty });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.quantity).toBe(targetQty);
  });

  it("should NOT update another user's cart item", async () => {
    const other = await prisma.cartItem.findFirst({
      where: { cart: { userId: { not: 2 } } },
    });
    if (other) {
      const res = await userAgent
        .put(`/api/cart/${other.id}`)
        .send({ quantity: 3 });
      expect(res.statusCode).toBe(403);
    }
  });

  it("should remove item from cart", async () => {
    const cart = await userAgent.get("/api/cart");
    const itemId = cart.body.data.items[0].id;

    const res = await userAgent.delete(`/api/cart/${itemId}`);
    expect(res.statusCode).toBe(200);
  });

  it("should clear cart", async () => {
    const res = await userAgent.delete("/api/cart");
    expect(res.statusCode).toBe(200);
  });
});
