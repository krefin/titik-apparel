import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const adminAgent = request.agent(app);
const customerAgent = request.agent(app);

let createdUserId;

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
  if (createdUserId) {
    await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe("User Routes", () => {
  it("should NOT let customer list users", async () => {
    const res = await customerAgent.get("/api/users");
    expect(res.statusCode).toBe(403);
  });

  it("should let admin list users without password", async () => {
    const res = await adminAgent.get("/api/users?limit=10");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain('"password"');
  });

  it("should let admin create a user with admin role", async () => {
    const res = await adminAgent.post("/api/users").send({
      name: "Staff Baru",
      email: `staff_${Date.now()}@titikapparel.com`,
      password: "password123",
      role: "admin",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.role).toBe("admin");
    expect(res.body.data.password).toBeUndefined();
    createdUserId = res.body.data.id;
  });

  it("should NOT let customer create a user", async () => {
    const res = await customerAgent.post("/api/users").send({
      name: "Hacker",
      email: `hacker_${Date.now()}@x.com`,
      password: "password123",
      role: "admin",
    });
    expect(res.statusCode).toBe(403);
  });

  it("should let admin update a user", async () => {
    const res = await adminAgent
      .put(`/api/users/${createdUserId}`)
      .send({ name: "Staff Update", role: "customer" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Staff Update");
    expect(res.body.data.role).toBe("customer");
  });

  it("should let a user update their own profile only", async () => {
    const res = await customerAgent
      .put(`/api/users/${createdUserId}`)
      .send({ name: "Nakal" });
    expect(res.statusCode).toBe(403);
  });

  it("should NOT let customer change own role to admin", async () => {
    const me = await customerAgent.get("/api/auth/me");
    const res = await customerAgent
      .put(`/api/users/${me.body.data.id}`)
      .send({ role: "admin" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.role).toBe("customer");
  });

  it("should let admin delete a user", async () => {
    const res = await adminAgent.delete(`/api/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    createdUserId = null;
  });
});
