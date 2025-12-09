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
  checkout,
  type CartItem as ApiCartItem,
} from "@/lib/api/cart";
import { it } from "node:test";

/**
 * Komponen Cart & Checkout (disesuaikan dengan lib/api/cart.ts)
 *
 * Asumsi:
 * - getCart() => { data: CartItem[], total: number }
 * - updateCartItem(cartItemId, qty)
 * - removeFromCart(cartItemId)
 * - checkout(payload)
 */

type Product = {
  id: number | string; // cart item id
  productId: number | string;
  name: string;
  price: number;
  qty: number;
  variant?: string;
  image?: string;
};

const currency = (amount: number) =>
  `Rp ${Number(amount).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
  })}`;

export default function CartAndCheckout() {
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

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCart() {
    setLoading(true);
    try {
      const res = await getCart(); // { data: ApiCartItem[], total }
      const items = (res.data ?? []).map((it: ApiCartItem) => ({
        id: it.id,
        productId: it.productId,
        name: it.name ?? (it as any).product?.name ?? "Product",
        price: Number(it.price ?? (it as any).product?.price ?? 0),
        qty: Number(it.quantity ?? (it as any).qty ?? 1),
        image: it.image ?? (it as any).product?.image ?? undefined,
      })) as Product[];

      setCart(items);
    } catch (err) {
      console.error("fetchCart error:", err);
      alert("Gagal mengambil data keranjang. Cek console.");
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
    return 20000;
  }, [courier]);
  const total = subtotal + shipping;

  async function updateQty(id: number | string, qty: number) {
    const newQty = Math.max(1, qty);
    // optimistic update
    setCart((c) => c.map((p) => (p.id === id ? { ...p, qty: newQty } : p)));
    try {
      await updateCartItem(id, newQty);
      await fetchCart(); // sync
    } catch (err) {
      console.error("updateQty error:", err);
      alert("Gagal memperbarui jumlah. Cek console.");
      await fetchCart(); // rollback
    }
  }

  async function removeItem(id: number | string) {
    if (!confirm("Hapus item dari keranjang?")) return;

    // optimistic remove
    const prev = cart;
    setCart((c) => c.filter((p) => p.id !== id));

    try {
      await removeFromCart(id);
      await fetchCart();
    } catch (err) {
      console.error("removeItem error:", err);
      alert("Gagal menghapus item. Cek console.");
      setCart(prev); // rollback
    }
  }

  function proceedToCheckout() {
    if (cart.length === 0) {
      alert("Keranjang kosong, tambahkan produk terlebih dahulu.");
      return;
    }
    setView("checkout");
  }

  async function placeOrder() {
    if (!address.fullName || !address.addressLine || !address.city) {
      alert("Isi nama, alamat, dan kota sebelum checkout.");
      return;
    }

    const payload = {
      address: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        postal: address.postal,
        notes: address.notes,
      },
      paymentMethod: payment,
      courier,
      cart: cart.map((c) => ({ productId: c.productId, quantity: c.qty })),
    };

    setLoading(true);
    try {
      const res = await checkout(payload);
      const orderId =
        res?.data?.id ?? res?.data?.orderId ?? res?.orderId ?? res?.id ?? null;

      alert(
        orderId
          ? `Pesanan berhasil dibuat: ${orderId}`
          : "Pesanan berhasil dibuat."
      );

      // cleanup
      setCart([]);
      setView("cart");
      setAddress({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        postal: "",
        notes: "",
      });
      setPayment("va");
      setCourier("jne_regular");
      await fetchCart();
    } catch (err) {
      console.error("placeOrder error:", err);
      alert("Gagal membuat pesanan. Cek console.");
    } finally {
      setLoading(false);
    }
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
                        className="flex items-center gap-4 p-4 rounded-lg border"
                      >
                        <div className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center text-sm font-medium text-slate-500">
                          {p.image ? (
                            // next/image could be used, but keep <img> for simplicity here
                            <img
                              src={p.image}
                              alt={p.name}
                              className="object-cover w-full h-full rounded-md"
                            />
                          ) : (
                            "Img"
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{p.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {p.variant}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {currency(p.price)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {currency(p.price * p.qty)}
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

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <Button
                        onClick={() => {
                          /* continue shopping */
                        }}
                        variant="outline"
                      >
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
                      <div className="flex gap-2">
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

                <div className="mt-6 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setView("cart")}>
                    Kembali ke Keranjang
                  </Button>
                  <Button onClick={placeOrder} disabled={loading}>
                    {loading ? "Memproses..." : "Bayar Sekarang"}
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
                        className="w-full"
                        onClick={placeOrder}
                        disabled={loading}
                      >
                        {loading ? "Memproses..." : "Konfirmasi & Bayar"}
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
