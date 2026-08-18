import api from "../axios";
import { getErrorStatus } from "../errors";

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  name?: string;
  image?: string | null;
  price: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    stock: number;
    description: string;
    image?: string | null;
  } | null;
};

export type Order = {
  id: number;
  userId: number;
  totalPrice: number;
  shippingCost: number;
  grandTotal: number;
  status:
    | "pending"
    | "paid"
    | "settlement"
    | "processing"
    | "process"
    | "shipped"
    | "shipping"
    | "completed"
    | "done"
    | "failed"
    | "cancelled"
    | "canceled";
  paymentMethod: string | null;
  courier: string | null;
  recipientName: string | null;
  telephone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type OrdersResponse = {
  data: Order[];
  total: number;
  page?: number;
  limit?: number;
};

export async function getOrderByIdApi(
  orderId: number | string
): Promise<Order | null> {
  try {
    const res = await api.get(`/api/orders/${orderId}`);
    if (res.data?.success) return res.data.data as Order;
    return res.data?.data ?? (res.data as Order);
  } catch (err: unknown) {
    if (getErrorStatus(err) === 404) return null;
    throw err;
  }
}

export async function updateOrderStatusApi(
  orderId: number | string,
  status: string
) {
  try {
    const res = await api.put(`/api/orders/${orderId}/status`, { status });
    return res.data?.data ?? res.data ?? null;
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
