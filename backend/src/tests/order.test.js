import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

let token;
let productId;
let orderId;

beforeAll(async () => {
  // login as customer
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "customer@titikapparel.com", password: "customer123" });
  token = res.body.token;

  // ambil product
  const products = await request(app).get("/api/products");
  productId = products.body.data[0].id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Order Routes", () => {
  it("should create an order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId, quantity: 1, price: 100000 }] });
    expect(res.statusCode).toBe(201);
    orderId = res.body.data.id;
  });

  it("should get orders by user", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should get order by id", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(orderId);
  });
});
