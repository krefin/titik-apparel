// lib/api/products.ts
import api from "@/lib/axios";

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  createdAt: string;
  image?: string;
};

type Paginated<T> = {
  data: T[];
  total?: number;
  // tambahkan metadata kalau perlu: page, perPage, etc
};

export async function getProducts(
  params: GetProductsParams = {}
): Promise<{ data: Product[]; total: number }> {
  try {
    const res = await api.get("/api/products", { params });

    const payload = res.data ?? {};

    // 🔒 NORMALISASI
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }

    if (Array.isArray(payload.data)) {
      return {
        data: payload.data,
        total: Number(payload.total ?? payload.data.length),
      };
    }

    // fallback aman
    return { data: [], total: 0 };
  } catch (err) {
    console.error("getProducts error:", err);
    return { data: [], total: 0 };
  }
}

export async function getProductById(
  id: number | string
): Promise<Product | null> {
  try {
    const res = await api.get(`/api/products/${id}`);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

export async function createProduct(payload: Partial<Product>) {
  const res = await api.post("/api/products", payload);
  return res.data;
}

export async function updateProduct(
  id: number | string,
  payload: Partial<Product>
) {
  const res = await api.put(`/api/products/${id}`, payload);
  return res.data;
}

export async function deleteProduct(id: number | string) {
  const res = await api.delete(`/api/products/${id}`);
  return res.data;
}
