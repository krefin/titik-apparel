import app from "./app.js";
import { env } from "./lib/env.js";
import prisma from "./lib/prisma.js";
import { initSocket } from "./lib/socket.js";

const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});

initSocket(server);

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
