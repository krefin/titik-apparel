import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const customerAgent = request.agent(app);
const adminAgent = request.agent(app);

let productId;
let productPrice;
let orderId;

beforeAll(async () => {
  let res = await customerAgent.post("/api/auth/login").send({
    email: "customer@titikapparel.com",
    password: "customer123",
  });
  expect(res.statusCode).toBe(200);

  res = await adminAgent.post("/api/auth/login").send({
    email: "admin@titikapparel.com",
    password: "admin123",
  });
  expect(res.statusCode).toBe(200);

  const products = await request(app).get("/api/products?limit=1");
  productId = products.body.data[0].id;
  productPrice = products.body.data[0].price;
});

afterAll(async () => {
  if (orderId) {
    await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe("Order Routes", () => {
  it("should create an order with price from DB", async () => {
    const res = await customerAgent.post("/api/orders").send({
      items: [{ productId, quantity: 1, price: 1 }], // price dari client diabaikan
      courier: "jne_regular",
      paymentMethod: "va",
      recipientName: "John Doe",
      telephone: "0812",
      address: "Jl Test 1",
      city: "Jakarta",
      postalCode: "12345",
    });
    expect(res.statusCode).toBe(201);
    orderId = res.body.data.id;
    expect(res.body.data.totalPrice).toBe(productPrice);
    expect(res.body.data.shippingCost).toBe(20000);
    expect(res.body.data.grandTotal).toBe(productPrice + 20000);
    expect(res.body.data.items[0].price).toBe(productPrice);
  });

  it("should reject empty order", async () => {
    const res = await customerAgent.post("/api/orders").send({ items: [] });
    expect(res.statusCode).toBe(400);
  });

  it("should get orders by user", async () => {
    const res = await customerAgent.get("/api/orders");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should get order by id (owner)", async () => {
    const res = await customerAgent.get(`/api/orders/${orderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(orderId);
  });

  it("should NOT expose other user's order (IDOR)", async () => {
    const otherOrder = await prisma.order.findFirst({
      where: { userId: { not: 2 } },
    });
    if (otherOrder) {
      const res = await customerAgent.get(`/api/orders/${otherOrder.id}`);
      expect(res.statusCode).toBe(403);
    }
  });

  it("should NOT let customer update order status", async () => {
    const res = await customerAgent
      .put(`/api/orders/${orderId}/status`)
      .send({ status: "paid" });
    expect(res.statusCode).toBe(403);
  });

  it("should let admin update order status", async () => {
    const res = await adminAgent
      .put(`/api/orders/${orderId}/status`)
      .send({ status: "shipped" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("shipped");
  });

  it("should reject invalid order status", async () => {
    const res = await adminAgent
      .put(`/api/orders/${orderId}/status`)
      .send({ status: "hacked" });
    expect(res.statusCode).toBe(400);
  });

  it("should let admin list all orders", async () => {
    const res = await adminAgent.get("/api/orders/all?limit=5");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should NOT let customer list all orders", async () => {
    const res = await customerAgent.get("/api/orders/all");
    expect(res.statusCode).toBe(403);
  });
});
