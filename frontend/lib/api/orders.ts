import api from "../axios";
export type Order = {
  id: number;
  userId: number;
  totalPrice: number;
  status: "paid" | "pending";
};

export type OrdersResponse = {
  data: Order[];
  total: number;
};

// helper: panggil endpoint PUT /api/orders/:id/status
async function updateOrderStatusApi(orderId: number | string, status: string) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      credentials: "include", // pastikan BE pakai cookie/session, atau gunakan Authorization header
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }
    const payload = await res.json();
    return payload?.data ?? payload ?? null;
  } catch (err) {
    console.error("updateOrderStatusApi error:", err);
    throw err;
  }
}

export async function getAllOrdersApi(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<OrdersResponse> {
  try {
    const res = await api.get("/api/orders/all", { params });
    const payload = res.data ?? {};
    // console.log(payload);

    // 🔒 NORMALISASI (SAMA SEPERTI PRODUCTS)
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }

    if (Array.isArray(payload.data)) {
      return {
        data: payload.data,
        total: Number(payload.total ?? payload.data.length),
      };
    }

    return { data: [], total: 0 };
  } catch (err) {
    console.error("getAllOrdersApi error:", err);
    return { data: [], total: 0 };
  }
}
