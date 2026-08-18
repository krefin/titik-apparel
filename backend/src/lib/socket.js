import { Server } from "socket.io";
import { env } from "./env.js";

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.clientOrigin || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join user room by userId
    socket.on("join_user_room", (userId) => {
      if (userId) {
        const roomName = `user_${userId}`;
        socket.join(roomName);
        console.log(`[Socket] Client ${socket.id} joined room ${roomName}`);
      }
    });

    // Join admin room
    socket.on("join_admin_room", () => {
      socket.join("admin_room");
      console.log(`[Socket] Client ${socket.id} joined admin_room`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("[Socket] Socket.io not initialized yet");
  }
  return io;
};

export const emitCartUpdate = (userId, cartData = null) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit("cart_updated", { userId, cart: cartData });
  }
};

export const emitStockUpdate = (productId, stock) => {
  if (io) {
    io.emit("stock_updated", { productId, stock });
  }
};

export const emitOrderStatusUpdate = (userId, order) => {
  if (io) {
    if (userId) {
      io.to(`user_${userId}`).emit("order_status_updated", { order });
    }
    io.to("admin_room").emit("order_status_updated", { order });
  }
};

export const emitNewOrderNotification = (order) => {
  if (io) {
    io.to("admin_room").emit("new_order", { order });
  }
};
