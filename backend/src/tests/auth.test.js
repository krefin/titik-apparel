import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

describe("Auth Routes", () => {
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: "testuser" } },
    });
    await prisma.$disconnect();
  });

  const uniqueEmail = `testuser_${Date.now()}@example.com`;

  it("should register a new user (default role customer)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: uniqueEmail,
      password: "password123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("customer");
    expect(res.body.data.password).toBeUndefined();
  });

  it("should NOT allow choosing admin role via register", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Evil User",
        email: `evil_${Date.now()}@example.com`,
        password: "password123",
        role: "admin",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.role).toBe("customer");
  });

  it("should reject duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: uniqueEmail,
      password: "password123",
    });
    expect(res.statusCode).toBe(409);
  });

  it("should reject invalid registration data", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "",
      email: "not-an-email",
      password: "123",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should login and set auth cookie", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: uniqueEmail,
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toContain("token=");
  });

  it("should return /me for authenticated user", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({
      email: uniqueEmail,
      password: "password123",
    });
    const res = await agent.get("/api/auth/me");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(uniqueEmail);
    expect(res.body.data.password).toBeUndefined();
  });

  it("should logout and clear cookie", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({
      email: uniqueEmail,
      password: "password123",
    });
    const res = await agent.post("/api/auth/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should change password when current password is correct", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({
      email: uniqueEmail,
      password: "password123",
    });
    const res = await agent.put("/api/auth/password").send({
      currentPassword: "password123",
      newPassword: "newpassword456",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject wrong current password", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({
      email: uniqueEmail,
      password: "newpassword456",
    });
    const res = await agent.put("/api/auth/password").send({
      currentPassword: "wrongpass",
      newPassword: "something123",
    });
    expect(res.statusCode).toBe(400);
  });
});
