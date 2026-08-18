"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSocket, joinUserRoom, joinAdminRoom } from "@/lib/socket";
import { useAuth } from "./AuthProvider";

type SocketContextType = {
  cartUpdateTick: number;
  lastStockUpdate: { productId: number; stock: number } | null;
  lastOrderStatusUpdate: any | null;
  notification: string | null;
  clearNotification: () => void;
};

const SocketContext = createContext<SocketContextType>({
  cartUpdateTick: 0,
  lastStockUpdate: null,
  lastOrderStatusUpdate: null,
  notification: null,
  clearNotification: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartUpdateTick, setCartUpdateTick] = useState(0);
  const [lastStockUpdate, setLastStockUpdate] = useState<{ productId: number; stock: number } | null>(null);
  const [lastOrderStatusUpdate, setLastOrderStatusUpdate] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    if (user?.id) {
      joinUserRoom(user.id);
    }
    if (user?.role === "admin") {
      joinAdminRoom();
    }

    // Listen to real-time events
    const handleCartUpdated = () => {
      setCartUpdateTick((prev) => prev + 1);
    };

    const handleStockUpdated = (data: { productId: number; stock: number }) => {
      setLastStockUpdate(data);
    };

    const handleOrderStatusUpdated = (data: { order: any }) => {
      setLastOrderStatusUpdate(data.order);
      setNotification(`Status pesanan #${data.order.id} diperbarui: ${data.order.status.toUpperCase()}`);
    };

    const handleNewOrder = (data: { order: any }) => {
      setNotification(`⚡ Pesanan baru masuk! ID #${data.order.id}`);
    };

    socket.on("cart_updated", handleCartUpdated);
    socket.on("stock_updated", handleStockUpdated);
    socket.on("order_status_updated", handleOrderStatusUpdated);
    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("cart_updated", handleCartUpdated);
      socket.off("stock_updated", handleStockUpdated);
      socket.off("order_status_updated", handleOrderStatusUpdated);
      socket.off("new_order", handleNewOrder);
    };
  }, [user]);

  const clearNotification = () => setNotification(null);

  return (
    <SocketContext.Provider
      value={{
        cartUpdateTick,
        lastStockUpdate,
        lastOrderStatusUpdate,
        notification,
        clearNotification,
      }}
    >
      {children}
      {/* Toast Notification Popup */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-700 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-xs font-semibold">{notification}</span>
          <button
            onClick={clearNotification}
            className="text-xs text-slate-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => useContext(SocketContext);
