import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

let token;
let productId;

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "customer@titikapparel.com", password: "customer123" });
  token = res.body.token;

  const products = await request(app).get("/api/products");
  productId = products.body.data[0].id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Cart Routes", () => {
  it("should add item to cart", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should get user cart", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it("should update cart item quantity", async () => {
    const cart = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);
    const itemId = cart.body.data.items[0].id;

    const res = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.quantity).toBe(5);
  });

  it("should remove item from cart", async () => {
    const cart = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);
    const itemId = cart.body.data.items[0].id;

    const res = await request(app)
      .delete(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it("should clear cart", async () => {
    const res = await request(app)
      .delete("/api/cart")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
