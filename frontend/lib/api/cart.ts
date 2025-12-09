// lib/api/cart.ts
import api from "@/lib/axios";

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  price: number;
  stock?: number;
  image?: string;
};

type CartResponseShape =
  | { items: any[] }
  | { data?: { items?: any[] } }
  | any[];

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
    const payload = res?.data as CartResponseShape | undefined;

    // Temukan array item dalam kemungkinan lokasi response
    const itemsRaw = Array.isArray((payload as any)?.items)
      ? (payload as any).items
      : Array.isArray((payload as any)?.data?.items)
      ? (payload as any).data.items
      : Array.isArray(payload)
      ? (payload as any)
      : Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : undefined;

    if (!itemsRaw || !Array.isArray(itemsRaw)) {
      // bentuk tak terduga -> kembalikan cart kosong
      return { data: [], total: 0 };
    }

    const items: CartItem[] = itemsRaw.map((it: any) => {
      const product = it.product ?? it.productData ?? {};
      return {
        id: Number(it.id ?? it.cartItemId ?? 0),
        productId: Number(it.productId ?? product.id ?? 0),
        quantity: Number(it.quantity ?? 0),
        name: String(product.name ?? it.name ?? "Unknown"),
        price: Number(product.price ?? it.price ?? 0),
        stock: product.stock != null ? Number(product.stock) : undefined,
        image: product.image ?? undefined,
      };
    });

    return { data: items, total: items.length };
  } catch (err: any) {
    const status = err?.response?.status;
    // pada 401: treat as "empty cart" (frontend tidak crash)
    if (status === 401) {
      // (opsional) console.warn("[getCart] unauthenticated, returning empty cart");
      return { data: [], total: 0 };
    }
    // untuk error lainnya, rethrow supaya caller bisa menangani
    throw err;
  }
}

// --- ADD TO CART ---
export async function addToCart(payload: AddCartPayload) {
  try {
    const res = await api.post("/api/cart", payload);
    return res.data;
  } catch (err) {
    // biarkan caller yang menangani error (mis. tampilkan notifikasi)
    throw err;
  }
}

// --- UPDATE QTY CART ITEM ---
export async function updateCartItem(cartItemId: number | string, qty: number) {
  try {
    const res = await api.put(`/api/cart/${cartItemId}`, { quantity: qty });
    console.log(qty);
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

// --- CHECKOUT ---
export async function checkout(payload: any) {
  try {
    const res = await api.post("/api/cart/checkout", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
}
