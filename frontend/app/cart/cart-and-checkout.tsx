"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CreditCard, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  createOrder,
  getPaymentToken,
  clearCart,
  type CartItem as ApiCartItem,
} from "@/lib/api/cart";
import { useRouter } from "next/navigation";
import { loadMidtransSnap } from "@/lib/midtrans";
import api from "@/lib/axios"; // axios instance (with baseURL/auth)
import { getErrorStatus } from "@/lib/errors";
import { useSocketContext } from "@/app/providers/SocketProvider";

type Product = {
  id: number | string; // cart item id
  productId: number | string;
  name: string;
  price: number;
  qty: number;
  variant?: string;
  image?: string;
};

type MidtransResult = {
  transaction_status?: string;
  transactionStatus?: string;
  status?: string;
  status_code?: string | number;
  statusCode?: string | number;
  order_id?: string;
  orderId?: string;
  transaction_id?: string;
  transactionId?: string;
  transaction?: { status?: string; id?: string };
  gross_amount?: string | number;
  transaction_details?: { order_id?: string; gross_amount?: string | number };
  fraud_status?: string;
  fraudStatus?: string;
  [key: string]: unknown;
};

const currency = (amount: number) =>
  `Rp ${Number(amount).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
  })}`;

export default function CartAndCheckout() {
  const router = useRouter();

  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"cart" | "checkout">("cart");

  // Checkout state
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    postal: "",
    notes: "",
  });

  const [payment, setPayment] = useState<"va" | "card" | "cod">("va");
  const [courier, setCourier] = useState<string>("jne_regular");
  const { cartUpdateTick } = useSocketContext();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartUpdateTick]);

  async function fetchCart() {
    setLoading(true);
    try {
      const res = await getCart(); // returns { data: CartItem[], total }
      const itemsRaw = res?.data ?? [];
      const items = (Array.isArray(itemsRaw) ? itemsRaw : []).map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.name ?? "Product",
        price: Number(it.price ?? 0),
        qty: Number(it.quantity ?? 1),
        image: it.image ?? undefined,
      })) as Product[];

      setCart(items);
    } catch (err) {
      console.error("fetchCart error:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }

  const subtotal = useMemo(
    () => cart.reduce((s, p) => s + p.price * p.qty, 0),
    [cart]
  );
  const shipping = useMemo(() => {
    if (courier.startsWith("jne")) return 20000;
    if (courier.startsWith("pos")) return 18000;
    if (courier.startsWith("tiki")) return 22000;
    return 0;
  }, [courier]);
  const total = subtotal + shipping;

  async function updateQty(id: number | string, qty: number) {
    const newQty = Math.max(1, qty);
    const prev = cart;
    setCart((c) => c.map((p) => (p.id === id ? { ...p, qty: newQty } : p)));
    try {
      await updateCartItem(id, newQty);
      await fetchCart();
    } catch (err) {
      console.error("updateQty error:", err);
      alert("Gagal memperbarui jumlah. Cek console.");
      setCart(prev);
    }
  }

  async function removeItem(id: number | string) {
    if (!confirm("Hapus item dari keranjang?")) return;
    const prev = cart;
    setCart((c) => c.filter((p) => p.id !== id));
    try {
      await removeFromCart(id);
      await fetchCart();
    } catch (err) {
      console.error("removeItem error:", err);
      alert("Gagal menghapus item. Cek console.");
      setCart(prev);
    }
  }

  function proceedToCheckout() {
    if (cart.length === 0) {
      alert("Keranjang kosong, tambahkan produk terlebih dahulu.");
      return;
    }
    setView("checkout");
  }

  // -----------------------
  // Helper: update order status via axios PUT
  // -----------------------
  async function updateOrderStatusApi(
    orderId: number | string,
    status: string
  ) {
    try {
      const res = await api.put(
        `/api/orders/${orderId}/status`,
        { status },
        { withCredentials: true }
      );
      return res?.data?.data ?? res?.data ?? res ?? null;
    } catch (err: unknown) {
      console.error("updateOrderStatusApi error:", err);
      throw err;
    }
  }

  // -----------------------
  // Helper: send Midtrans-like notification payload to backend
  // (backend already exposes POST /api/payment/notification)
  // -----------------------
  async function sendNotificationToBackend(
    orderId: number | string,
    midtransResult: MidtransResult
  ) {
    const body = {
      order_id: String(orderId),
      transaction_status:
        midtransResult.transaction_status ??
        midtransResult.transactionStatus ??
        midtransResult.status ??
        midtransResult.transaction?.status ??
        "unknown",
      transaction_id:
        midtransResult.transaction_id ??
        midtransResult.transactionId ??
        midtransResult.transaction?.id ??
        undefined,
      gross_amount:
        midtransResult.gross_amount ??
        midtransResult.transaction_details?.gross_amount ??
        undefined,
      fraud_status:
        midtransResult.fraud_status ?? midtransResult.fraudStatus ?? undefined,
      raw: midtransResult, // optional for backend debugging
    };

    try {
      const res = await api.post("/api/payment/notification", body, {
        withCredentials: true,
      });
      return res?.data ?? res;
    } catch (err) {
      // bubble up so caller can fallback
      throw err;
    }
  }

  // -----------------------
  // Helper: clear cart (server + UI)
  // -----------------------
  async function clearCartBoth() {
    try {
      await clearCart();
    } catch (err) {
      // Non-fatal: log but continue to clear UI cart
      console.warn("clearCart (server) failed:", err);
    }
    setCart([]);
  }

  /**
   * placeOrder:
   * 1) create order: POST /api/orders { items, shipping, courier, address, totalPrice }
   * 2) request snap token: POST /api/payment/token { orderId }
   * 3) load midtrans snap and call snap.pay(token)
   * 4) immediately notify backend (POST /api/payment/notification) from client using Midtrans result
   * 5) fallback: if backend not updated but Midtrans indicates settlement -> call PUT /api/orders/:id/status
   * 6) when payment confirmed -> clear cart (server + UI)
   */
  async function placeOrder() {
    // Prepare items as backend tests expect
    const itemsPayload = cart.map((c) => ({
      productId: c.productId,
      quantity: c.qty,
      price: c.price,
    }));

    if (itemsPayload.length === 0) {
      alert("Keranjang kosong.");
      return;
    }

    try {
      setLoading(true);

      // 1) create order on backend — include shipping & totalPrice
      const itemsTotal = subtotal;
      const roundedTotal = Math.round(total); // integer for Midtrans

      console.log("Creating order payload:", {
        items: itemsPayload,
        itemsTotal,
        shipping,
        shipping_cost: shipping,
        courier,
        address,
        totalPrice: roundedTotal,
        total_price: roundedTotal,
        grandTotal: roundedTotal,
        amount: roundedTotal,
      });

      const createRes = await createOrder({
        items: itemsPayload,
        itemsTotal,
        shipping,
        shipping_cost: shipping,
        courier,
        totalPrice: roundedTotal,
        total_price: roundedTotal,
        grandTotal: roundedTotal,
        amount: roundedTotal,
        paymentMethod: payment,
        recipientName: address.fullName,
        telephone: address.phone,
        address: address.addressLine,
        city: address.city,
        postalCode: address.postal,
        notes: address.notes,
      });

      const createData = createRes?.data ? createRes.data : createRes;
      const order = createData?.data ?? createData?.order ?? createData ?? null;

      console.log(
        "createOrder response:",
        createRes,
        "normalized order:",
        order
      );

      if (!order || !order.id) {
        console.error("createOrder: unexpected response", createRes);
        alert("Gagal membuat pesanan (response tidak sesuai). Cek console.");
        return;
      }

      const orderId = order.id;

      // Sanity check: if backend didn't persist totals, warn
      if (
        Number(
          order.totalPrice ?? order.total_price ?? order.grandTotal ?? 0
        ) !== roundedTotal ||
        Number(order.shipping ?? order.shipping_cost ?? 0) !== Number(shipping)
      ) {
        console.warn(
          "Order returned without expected totals/shipping. Backend may be ignoring FE totals.",
          {
            order,
            sent: { total: roundedTotal, shipping },
          }
        );
      }

      // 2) request snap token
      const tokenRes = await getPaymentToken(orderId);
      console.log("getPaymentToken response:", tokenRes);
      const tokenData = tokenRes?.data ? tokenRes.data : tokenRes;

      const snapToken =
        tokenData?.token ??
        tokenData?.data?.token ??
        tokenData?.data?.snapToken ??
        null;
      const redirectUrl =
        tokenData?.redirectUrl ??
        tokenData?.redirect_url ??
        tokenData?.data?.redirectUrl ??
        tokenData?.data?.redirect_url ??
        null;

      const clientKey =
        tokenData?.clientKey ??
        tokenData?.data?.clientKey ??
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??
        null;

      if (snapToken) {
        if (!clientKey) {
          console.error(
            "Missing Midtrans clientKey (provide via env or backend)"
          );
          alert("Konfigurasi pembayaran tidak lengkap. Hubungi admin.");
          return;
        }

        try {
          await loadMidtransSnap(clientKey, false);
        } catch (err) {
          console.error("Failed to load Midtrans script:", err);
          alert("Gagal memuat modul pembayaran. Silakan coba lagi nanti.");
          return;
        }

        const snap = (window as any).snap;
        if (!snap || !snap.pay) {
          console.error("Midtrans Snap not available", snap);
          alert("Modul pembayaran tidak tersedia.");
          return;
        }

        // open Midtrans UI with direct-notify + fallback update approach
        snap.pay(snapToken, {
          onSuccess: async (result: MidtransResult) => {
            console.log("MIDTRANS snap.onSuccess result:", result);

            // tolerant parse
            const txStatus = (
              result.transaction_status ??
              result.status ??
              result.transactionStatus ??
              ""
            )
              .toString()
              .toLowerCase();
            const statusCode = (
              result.status_code ??
              result.statusCode ??
              ""
            ).toString();
            const midOrderId =
              result.order_id ??
              result.orderId ??
              result.transaction_details?.order_id ??
              orderId;

            // 1) Try notifying backend with the Midtrans payload (backend will update DB)
            try {
              const notifyRes = await sendNotificationToBackend(
                midOrderId,
                result
              );
              console.log("notifyRes:", notifyRes);

              const updated = notifyRes?.data ?? notifyRes ?? null;
              const updatedStatus =
                updated?.status ?? updated?.data?.status ?? null;

              const isPaid =
                String(updatedStatus ?? "").toLowerCase() === "paid" ||
                String(updatedStatus ?? "").toLowerCase() === "settlement" ||
                String(updatedStatus ?? "").toLowerCase() === "lunas";

              if (isPaid) {
                // clear cart both places
                await clearCartBoth();
                alert("Pembayaran berhasil dan status diperbarui.");
                router.push(`/orders`);
                return;
              }

              // backend responded but didn't set paid => if Midtrans says settled, attempt forced update
              const midtransSaysSettled =
                txStatus === "settlement" ||
                txStatus === "capture" ||
                statusCode === "200";

              if (midtransSaysSettled) {
                try {
                  const forced = await updateOrderStatusApi(orderId, "paid");
                  console.log("forced update result:", forced);
                  await clearCartBoth();
                  alert(
                    "Pembayaran terkonfirmasi. Status diupdate ke 'paid'. Anda akan diarahkan ke halaman pesanan."
                  );
                  router.push(`/orders`);
                  return;
                } catch (err) {
                  console.error("Forced update failed after notify:", err);
                  // still clear UI cart to avoid duplicate payment attempts by user
                  setCart([]);
                  alert(
                    "Midtrans mengonfirmasi pembayaran, namun server belum terupdate. Anda diarahkan ke halaman pesanan. Jika status belum berubah dalam beberapa menit, hubungi admin."
                  );
                  router.push(`/orders`);
                  return;
                }
              } else {
                // not settled and backend didn't mark paid -- go to orders
                alert(
                  "Pembayaran selesai tetapi server mencatat status lain. Cek halaman pesanan."
                );
                router.push(`/orders`);
                return;
              }
            } catch (notifyErr) {
              console.error("notify backend failed:", notifyErr);

              // fallback: if midtrans clearly says settled, try forcing update
              const midtransSaysSettled =
                txStatus === "settlement" ||
                txStatus === "capture" ||
                statusCode === "200";

              if (midtransSaysSettled) {
                try {
                  const forced = await updateOrderStatusApi(orderId, "paid");
                  console.log("forced update after notify failure:", forced);
                  await clearCartBoth();
                  alert(
                    "Midtrans mengonfirmasi pembayaran dan kami berhasil memperbarui status pesanan. Anda akan diarahkan ke halaman pesanan."
                  );
                  router.push(`/orders`);
                  return;
                } catch (putErr) {
                  console.error("Forced PUT failed:", putErr);
                  // clear UI cart, server will eventually be updated by webhook or admin
                  setCart([]);
                  alert(
                    "Midtrans mengonfirmasi pembayaran (settlement) namun server belum menerima notifikasi. Anda akan diarahkan ke halaman pesanan. Jika status belum berubah setelah beberapa menit, hubungi admin."
                  );
                  router.push(`/orders`);
                  return;
                }
              } else {
                // not settled & notify failed -> go to orders with warning
                setCart([]); // remove local cart so user doesn't accidentally re-buy
                alert(
                  "Pembayaran berhasil di Midtrans, tetapi kami gagal menghubungi server. Silakan cek halaman pesanan atau hubungi admin."
                );
                router.push(`/orders`);
                return;
              }
            }
          },

          onPending: async (result: MidtransResult) => {
            console.log("MIDTRANS snap.onPending result:", result);

            // For pending we still notify backend so it records pending state
            try {
              await sendNotificationToBackend(orderId, result);
              // do NOT clear cart: user still needs to pay
              alert(
                "Pembayaran tercatat PENDING. Lanjutkan pembayaran sesuai instruksi atau cek halaman pesanan."
              );
              router.push(`/orders`);
            } catch (err) {
              console.error("notify pending failed:", err);
              alert(
                "Pembayaran PENDING. Gagal menghubungi server; cek halaman pesanan atau hubungi admin."
              );
              router.push(`/orders`);
            }
          },

          onError: (result: MidtransResult) => {
            console.error("MIDTRANS snap.onError:", result);
            alert("Pembayaran gagal. Cek console untuk detail.");
          },

          onClose: () => {
            alert(
              "Pembayaran belum selesai. Anda dapat melanjutkan pembayaran dari halaman pesanan."
            );
            router.push(`/orders`);
          },
        });

        // keep UI cart until payment confirmed; do not clear here (we clear on confirmation).
        return;
      }

      // fallback: redirect if backend returned redirect url
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      // final fallback: order created but no payment flow — go to order page
      alert(`Pesanan dibuat: ${order.id}`);
      router.push(`/orders`);
    } catch (err: unknown) {
      console.error("placeOrder error:", err);
      if (getErrorStatus(err) === 401) {
        alert("Silakan login terlebih dahulu.");
        router.push("/auth/user/login");
        return;
      }
      alert("Gagal membuat pesanan. Cek console.");
    } finally {
      setLoading(false);
    }
  }
  function buildImageUrl(image?: string | null): string | null {
    if (!image || !image.trim()) return null;

    // jika sudah full URL (unsplash, dll) → pakai langsung
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const base = process.env.NEXT_PUBLIC_API_IMAGE_URL;
    if (!base) return null;

    return `${base.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Cart or Checkout main column */}
        <div className="lg:col-span-2">
          {view === "cart" ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Keranjang Belanja</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && cart.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Memuat...
                  </div>
                ) : cart.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Keranjang kosong — tambahkan produk dulu.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
                      >
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-sm font-medium text-slate-500 overflow-hidden shrink-0">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={buildImageUrl(p.image) ?? ""}
                              alt={p.name}
                              className="object-cover w-full h-full rounded-xl"
                            />
                          ) : (
                            "Img"
                          )}
                        </div>
                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{p.name}</div>
                              {p.variant && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {p.variant}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                                {currency(p.price * p.qty)}
                              </div>
                              <div className="text-xs text-slate-400">
                                @{currency(p.price)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center border rounded-md overflow-hidden">
                              <button
                                className="px-3 py-1"
                                onClick={() => updateQty(p.id, p.qty - 1)}
                                aria-label="kurangi"
                              >
                                -
                              </button>
                              <div className="px-4 py-1">{p.qty}</div>
                              <button
                                className="px-3 py-1"
                                onClick={() => updateQty(p.id, p.qty + 1)}
                                aria-label="tambah"
                              >
                                +
                              </button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(p.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-muted-foreground">
                        Subtotal
                      </div>
                      <div className="font-semibold">{currency(subtotal)}</div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Ongkos Kirim (estimasi)
                      </div>
                      <div className="font-semibold">{currency(shipping)}</div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-lg font-semibold">Total</div>
                      <div className="text-xl font-bold">{currency(total)}</div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <Button onClick={() => setView("cart")} variant="outline">
                        Lanjut Belanja
                      </Button>
                      <Button onClick={proceedToCheckout}>
                        Checkout <ArrowRight className="ml-2" size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin size={16} /> Alamat Pengiriman
                    </h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nama lengkap"
                        value={address.fullName}
                        onChange={(e) =>
                          setAddress((a) => ({
                            ...a,
                            fullName: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Nomor HP"
                        value={address.phone}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, phone: e.target.value }))
                        }
                      />
                      <Textarea
                        placeholder="Alamat lengkap (jalan, rt/rw, blok)"
                        value={address.addressLine}
                        onChange={(e) =>
                          setAddress((a) => ({
                            ...a,
                            addressLine: e.target.value,
                          }))
                        }
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Kota / Kabupaten"
                          value={address.city}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, city: e.target.value }))
                          }
                        />
                        <Input
                          placeholder="Kode pos"
                          value={address.postal}
                          onChange={(e) =>
                            setAddress((a) => ({
                              ...a,
                              postal: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Input
                        placeholder="Catatan (opsional)"
                        value={address.notes}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, notes: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Truck size={16} /> Ekspedisi & Layanan
                    </h4>
                    <div className="space-y-2">
                      <Select
                        onValueChange={(v) => setCourier(v)}
                        defaultValue={courier}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kurir & layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jne_regular">JNE - REG</SelectItem>
                          <SelectItem value="jne_yes">JNE - YES</SelectItem>
                          <SelectItem value="pos_kilat">
                            POS - Kilat Khusus
                          </SelectItem>
                          <SelectItem value="tiki_eco">TIKI - ECO</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="text-sm text-muted-foreground">
                        Estimasi: 1–3 hari kerja
                      </div>

                      <Separator className="my-2" />

                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CreditCard size={16} /> Metode Pembayaran
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <input
                            id="pay_va"
                            type="radio"
                            name="pay"
                            checked={payment === "va"}
                            onChange={() => setPayment("va")}
                          />
                          <label htmlFor="pay_va" className="text-sm">
                            Transfer (Virtual Account)
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            id="pay_card"
                            type="radio"
                            name="pay"
                            checked={payment === "card"}
                            onChange={() => setPayment("card")}
                          />
                          <label htmlFor="pay_card" className="text-sm">
                            Kartu Kredit / Debit
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            id="pay_cod"
                            type="radio"
                            name="pay"
                            checked={payment === "cod"}
                            onChange={() => setPayment("cod")}
                          />
                          <label htmlFor="pay_cod" className="text-sm">
                            Bayar di Tempat (COD)
                          </label>
                        </div>

                        {payment === "card" && (
                          <div className="mt-2 space-y-2">
                            <Input placeholder="Nama di kartu" />
                            <div className="flex gap-2">
                              <Input placeholder="Nomor kartu" />
                              <Input placeholder="MM/YY" />
                              <Input placeholder="CVC" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Button variant="ghost" onClick={() => setView("cart")} className="w-full sm:w-auto text-xs sm:text-sm">
                    Kembali ke Keranjang
                  </Button>
                  <Button onClick={placeOrder} disabled={loading} className="w-full sm:w-auto text-xs sm:text-sm py-3 sm:py-6 whitespace-normal text-center font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg">
                    {loading
                      ? "Memproses..."
                      : `Bayar Sekarang — ${currency(total)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Order summary */}
        <aside>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  {cart.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Tidak ada produk
                    </div>
                  ) : (
                    cart.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {p.qty} × {currency(p.price)}
                          </div>
                        </div>
                        <div className="font-semibold">
                          {currency(p.price * p.qty)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div className="font-semibold">{currency(subtotal)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Ongkos Kirim
                  </div>
                  <div className="font-semibold">{currency(shipping)}</div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Total</div>
                  <div className="text-xl font-bold">{currency(total)}</div>
                </div>

                <div className="mt-4">
                  {view === "cart" ? (
                    <Button className="w-full" onClick={proceedToCheckout}>
                      Lanjut ke Checkout
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        Metode:{" "}
                        {payment === "va"
                          ? "Virtual Account"
                          : payment === "card"
                          ? "Kartu"
                          : "COD"}
                      </Badge>
                      <Button
                        className="w-full text-xs sm:text-sm py-3 whitespace-normal text-center font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                        onClick={placeOrder}
                        disabled={loading}
                      >
                        {loading
                          ? "Memproses..."
                          : `Konfirmasi & Bayar — ${currency(total)}`}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-4 text-xs text-muted-foreground">
                  Pembelian aman. Gratis penukaran 7 hari.
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check size={14} /> Gratis pengemasan aman
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Check size={14} /> Dukungan 24/7
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
