// tests/payment.test.js
import request from "supertest";
import app from "../app.js";

let token;
const orderId = 1; // ganti sesuai order yang ada di database

beforeAll(async () => {
  // Login user untuk dapat token
  const resAuth = await request(app)
    .post("/api/auth/login")
    .send({ email: "customer@titikapparel.com", password: "customer123" });

  token = resAuth.body.token;

  if (!token) throw new Error("Login gagal: token tidak ditemukan");
});

describe("Payment Routes", () => {
  it("should create snap token", async () => {
    const res = await request(app)
      .post("/api/payment/token")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId }); // orderId harus ada di DB

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should handle payment notification", async () => {
    const res = await request(app)
      .post("/api/payment/notification")
      .send({ order_id: orderId, transaction_status: "settlement" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("paid");
  });
});
