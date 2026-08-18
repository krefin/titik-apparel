import { jest } from "@jest/globals";
import crypto from "crypto";

jest.unstable_mockModule("../lib/midtrans.js", () => ({
  default: { createTransaction: jest.fn() },
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");
const { default: prisma } = await import("../lib/prisma.js");
const { env } = await import("../lib/env.js");
const midtransMock = await import("../lib/midtrans.js");

const customerAgent = request.agent(app);
const adminAgent = request.agent(app);

let orderId;
let grandTotal;
let customerUserId;

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

  const customer = await prisma.user.findUnique({
    where: { email: "customer@titikapparel.com" },
  });
  customerUserId = customer.id;

  const products = await request(app).get("/api/products?limit=1");
  const product = products.body.data[0];
  res = await customerAgent.post("/api/orders").send({
    items: [{ productId: product.id, quantity: 1 }],
    courier: "pos_kilat",
    paymentMethod: "va",
  });
  orderId = res.body.data.id;
  grandTotal = res.body.data.grandTotal;
});

afterAll(async () => {
  if (orderId) {
    await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe("Payment Routes", () => {
  it("should create snap token for own order", async () => {
    midtransMock.default.createTransaction.mockResolvedValue({
      token: "mock-snap-token",
    });
    const res = await customerAgent
      .post("/api/payment/token")
      .send({ orderId });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe("mock-snap-token");
    expect(res.body.clientKey).toBeDefined();
  });

  it("should NOT create token for another user's order", async () => {
    const other = await prisma.order.findFirst({
      where: { userId: { not: customerUserId } },
    });
    if (other) {
      const res = await customerAgent
        .post("/api/payment/token")
        .send({ orderId: other.id });
      expect(res.statusCode).toBe(403);
    }
  });

  it("should reject notification with invalid signature", async () => {
    const res = await request(app)
      .post("/api/payment/notification")
      .send({ order_id: orderId, transaction_status: "settlement" });
    expect(res.statusCode).toBe(401);
  });

  it("should update order to paid with valid signature", async () => {
    const sig = crypto
      .createHash("sha512")
      .update(`${orderId}200${grandTotal}${env.midtransServerKey}`)
      .digest("hex");
    const res = await request(app)
      .post("/api/payment/notification")
      .set("x-midtrans-signature-key", sig)
      .send({
        order_id: orderId,
        status_code: "200",
        gross_amount: grandTotal,
        transaction_status: "settlement",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("paid");
  });

  it("should reject notification with mismatched amount", async () => {
    const sig = crypto
      .createHash("sha512")
      .update(`${orderId}2009999${env.midtransServerKey}`)
      .digest("hex");
    const res = await request(app)
      .post("/api/payment/notification")
      .set("x-midtrans-signature-key", sig)
      .send({
        order_id: orderId,
        status_code: "200",
        gross_amount: 9999,
        transaction_status: "settlement",
      });
    expect(res.statusCode).toBe(400);
  });
});
