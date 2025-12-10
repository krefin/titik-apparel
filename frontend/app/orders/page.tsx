"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/lib/axios";
import { format } from "date-fns";

type OrderItem = {
  id?: number;
  productId: number;
  quantity: number;
  price?: number;
  name?: string;
};

type Order = {
  id: number | string;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
};

function currency(amount?: number) {
  if (amount == null) return "Rp 0";
  return (
    "Rp " +
    Number(amount).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
    })
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get("/api/orders");
        const payload = res?.data ?? res;
        // normalisasi: tests return { data: [orders] }
        const data = payload?.data ?? payload ?? [];
        if (!Array.isArray(data)) {
          setOrders([]);
        } else if (mounted) {
          setOrders(data);
        }
      } catch (err: any) {
        console.error("fetch orders error", err);
        if (mounted)
          setError(
            err?.response?.data?.message ??
              err.message ??
              "Gagal mengambil pesanan"
          );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Pesanan Saya</h1>
            <p className="text-sm text-slate-500">
              Riwayat pembelian dan status pembayaran Anda.
            </p>
          </div>
        </header>

        <section>
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              Memuat pesanan...
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700">
              {error}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
              <p className="text-lg font-medium">Belum ada pesanan</p>
              <p className="mt-2 text-sm text-slate-500">
                Anda belum membuat pesanan apa pun. Ayo belanja!
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-block px-4 py-2 bg-sky-600 text-white rounded-md"
                >
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <article
                  key={o.id}
                  className="bg-white dark:bg-slate-800 border shadow-sm rounded-xl p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm text-slate-500">Order</div>
                          <div className="font-medium">#{o.id}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-slate-500">Total</div>
                          <div className="font-semibold">
                            {currency(o.totalPrice)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-sm">
                        <StatusBadge status={o.status} />
                        <div className="text-slate-500">•</div>
                        <div className="text-slate-500">
                          {formatDate(o.createdAt)}
                        </div>
                        <div className="text-slate-500">•</div>
                        <div className="text-slate-500">
                          {(o.items ?? []).length} item
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        {(o.items ?? []).slice(0, 2).map((it) => (
                          <div
                            key={it.productId}
                            className="flex items-center gap-3 mb-2"
                          >
                            <div className="w-10 h-10 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center text-xs text-slate-500">
                              {/* if product image exists, show it */}
                              {it.name ? it.name.charAt(0).toUpperCase() : ""}
                            </div>
                            <div>
                              <div className="font-medium">
                                {it.name ?? `Product #${it.productId}`}
                              </div>
                              <div className="text-sm text-slate-500">
                                {it.quantity} × {currency(it.price)}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(o.items ?? []).length > 2 && (
                          <div className="text-sm text-slate-500">
                            dan {(o.items ?? []).length - 2} item lainnya
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <Link
                        href={`/orders/${o.id}`}
                        className="text-sm text-sky-600 hover:underline"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    return format(new Date(dt), "dd LLL yyyy, HH:mm");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return dt;
  }
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "pending").toLowerCase();
  const label =
    {
      paid: "Lunas",
      settlement: "Lunas",
      pending: "Menunggu",
      cancel: "Dibatalkan",
      failed: "Gagal",
      shipped: "Dikirim",
      processing: "Diproses",
    }[s] ??
    status ??
    "Menunggu";

  const color =
    {
      paid: "bg-green-100 text-green-800 border-green-200",
      settlement: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      shipped: "bg-sky-100 text-sky-800 border-sky-200",
      cancel: "bg-red-100 text-red-800 border-red-200",
      failed: "bg-red-100 text-red-800 border-red-200",
    }[s] ?? "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium border ${color}`}
    >
      {label}
    </span>
  );
}
