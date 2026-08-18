// lib/api/cart.ts
import api from "@/lib/axios";
import { getErrorStatus } from "@/lib/errors";

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  price: number;
  stock?: number;
  image?: string;
};

/** payload untuk addToCart sederhana */
export type AddCartPayload = {
  productId: number;
  quantity?: number;
};

// ===========================
// GET CART (simple & resilient)
// ===========================
export async function getCart(): Promise<{ data: CartItem[]; total: number }> {
  try {
    const res = await api.get("/api/cart");
    const payload: unknown = res?.data;

    const itemsRaw = extractItemsArray(payload);

    if (!itemsRaw) {
      // bentuk tak terduga -> kembalikan cart kosong
      return { data: [], total: 0 };
    }

    const items: CartItem[] = itemsRaw.map((it) => {
      const product =
        (it as { product?: unknown }).product ??
        (it as { productData?: unknown }).productData ??
        {};
      const p = product as Record<string, unknown>;
      return {
        id: Number(it.id ?? it.cartItemId ?? 0),
        productId: Number(it.productId ?? p.id ?? 0),
        quantity: Number(it.quantity ?? 0),
        name: String(p.name ?? it.name ?? "Unknown"),
        price: Number(p.price ?? it.price ?? 0),
        stock: p.stock != null ? Number(p.stock) : undefined,
        image: p.image != null ? String(p.image) : undefined,
      };
    });

    return { data: items, total: items.length };
  } catch (err: unknown) {
    // pada 401: treat as "empty cart" (frontend tidak crash)
    if (getErrorStatus(err) === 401) {
      return { data: [], total: 0 };
    }
    // untuk error lainnya, rethrow supaya caller bisa menangani
    throw err;
  }
}

type CartItemRaw = Record<string, unknown>;

function extractItemsArray(payload: unknown): CartItemRaw[] | null {
  if (Array.isArray(payload)) return payload as CartItemRaw[];

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const candidates: unknown[] = [
      obj.items,
      (obj.data as Record<string, unknown> | undefined)?.items,
      obj.data,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as CartItemRaw[];
    }
  }

  return null;
}

// --- ADD TO CART ---
export async function addToCart(payload: AddCartPayload) {
  try {
    const res = await api.post("/api/cart", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// --- UPDATE QTY CART ITEM ---
export async function updateCartItem(cartItemId: number | string, qty: number) {
  try {
    const res = await api.put(`/api/cart/${cartItemId}`, { quantity: qty });
    return res.data;
  } catch (err) {
    throw err;
  }
}

// --- REMOVE ITEM FROM CART ---
export async function removeFromCart(cartItemId: number | string) {
  try {
    const res = await api.delete(`/api/cart/${cartItemId}`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// --- CLEAR CART ---
export async function clearCart() {
  try {
    const res = await api.delete("/api/cart");
    return res.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Create order on backend (POST /api/orders).
 * Backend requires auth (authMiddleware) — axios should send cookie.
 * Returns axios response (res) so FE can normalize shape.
 */
export async function createOrder(payload: unknown) {
  const res = await api.post("/api/orders", payload, {
    withCredentials: true,
  });
  return res;
}

/**
 * Request server to create a Midtrans snap token for an existing order.
 * BE route: POST /api/payment/token  (requires auth and expects { orderId } in body)
 */
export async function getPaymentToken(orderId: number | string) {
  const res = await api.post(
    "/api/payment/token",
    { orderId },
    { withCredentials: true }
  );
  return res;
}

/**
 * (Optional) wrapper used previously
 */
export async function checkout(payload: unknown) {
  return createOrder(payload);
}
