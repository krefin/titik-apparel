import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const adminAgent = request.agent(app);
const customerAgent = request.agent(app);

beforeAll(async () => {
  let res = await adminAgent.post("/api/auth/login").send({
    email: "admin@titikapparel.com",
    password: "admin123",
  });
  expect(res.statusCode).toBe(200);

  res = await customerAgent.post("/api/auth/login").send({
    email: "customer@titikapparel.com",
    password: "customer123",
  });
  expect(res.statusCode).toBe(200);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Admin Stats Routes", () => {
  it("should forbid customer", async () => {
    const res = await customerAgent.get("/api/admin/stats");
    expect(res.statusCode).toBe(403);
  });

  it("should return totals for admin", async () => {
    const res = await adminAgent.get("/api/admin/stats");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.totalOrders).toBe("number");
    expect(typeof res.body.data.totalProducts).toBe("number");
    expect(typeof res.body.data.totalUsers).toBe("number");
    expect(typeof res.body.data.revenue).toBe("number");
    expect(typeof res.body.data.productsSold).toBe("number");
  });

  it("should return monthly sales for admin", async () => {
    const res = await adminAgent.get("/api/admin/stats/monthly");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty("month");
      expect(res.body.data[0]).toHaveProperty("totalOrders");
      expect(res.body.data[0]).toHaveProperty("revenue");
    }
  });

  it("should forbid customer from monthly sales", async () => {
    const res = await customerAgent.get("/api/admin/stats/monthly");
    expect(res.statusCode).toBe(403);
  });
});
