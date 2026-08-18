import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:5000";

    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[WebSocket] Connected to server:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected from server");
    });
  }

  return socket;
};

export const joinUserRoom = (userId: number | string) => {
  const s = getSocket();
  if (s && userId) {
    s.emit("join_user_room", userId);
  }
};

export const joinAdminRoom = () => {
  const s = getSocket();
  if (s) {
    s.emit("join_admin_room");
  }
};
