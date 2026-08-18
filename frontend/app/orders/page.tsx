"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "@/lib/axios";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import { getErrorMessage } from "@/lib/errors";
import { resolveProductImage } from "@/lib/image";
import { processOrderPayment } from "@/lib/payment";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CreditCard,
  PackageCheck,
  Sparkles,
  MapPin,
  RefreshCw,
} from "lucide-react";

type OrderItem = {
  id?: number;
  productId: number;
  quantity: number;
  price?: number;
  productName?: string;
  name?: string;
  image?: string | null;
  product?: {
    id: number;
    name: string;
    price: number;
    stock: number;
    image?: string | null;
  } | null;
};

type Order = {
  id: number | string;
  totalPrice?: number;
  shippingCost?: number;
  grandTotal?: number;
  status?: string;
  createdAt?: string;
  courier?: string | null;
  recipientName?: string | null;
  city?: string | null;
  items?: OrderItem[];
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80",
];

function currency(amount?: number) {
  if (amount == null) return "Rp 0";
  return (
    "Rp " +
    Number(amount).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
    })
  );
}

function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    return format(new Date(dt), "dd MMM yyyy, HH:mm", { locale: idLocale });
  } catch {
    return dt;
  }
}

type TabStatus = "all" | "pending" | "processing" | "shipped" | "paid" | "completed" | "cancelled";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search state
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Record<string | number, boolean>>({});
  const [payingOrderId, setPayingOrderId] = useState<string | number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/orders");
      const payload = res?.data ?? res;
      const data = payload?.data ?? payload ?? [];
      if (!Array.isArray(data)) {
        setOrders([]);
      } else {
        setOrders(data);
      }
    } catch (err: unknown) {
      console.error("fetch orders error", err);
      setError(getErrorMessage(err, "Gagal mengambil daftar pesanan Anda"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId: string | number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handlePay = async (orderId: string | number) => {
    setPayingOrderId(orderId);
    await processOrderPayment(orderId, () => {
      setPayingOrderId(null);
      fetchOrders();
    });
    setPayingOrderId(null);
  };

  // Status counters for tab badges
  const counts = useMemo(() => {
    if (!orders) return { all: 0, pending: 0, processing: 0, shipped: 0, paid: 0, completed: 0, cancelled: 0 };
    return orders.reduce(
      (acc, o) => {
        const s = (o.status ?? "pending").toLowerCase();
        acc.all += 1;
        if (s === "pending") acc.pending += 1;
        else if (s === "processing" || s === "process") acc.processing += 1;
        else if (s === "shipped" || s === "shipping") acc.shipped += 1;
        else if (s === "completed" || s === "done") acc.completed += 1;
        else if (s === "paid" || s === "settlement") acc.paid += 1;
        else if (s === "cancel" || s === "cancelled" || s === "canceled" || s === "failed") acc.cancelled += 1;
        return acc;
      },
      { all: 0, pending: 0, processing: 0, shipped: 0, paid: 0, completed: 0, cancelled: 0 }
    );
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const s = (o.status ?? "pending").toLowerCase();
      
      // Tab filter
      let matchesTab = true;
      if (activeTab === "pending") matchesTab = s === "pending";
      else if (activeTab === "processing") matchesTab = s === "processing" || s === "process";
      else if (activeTab === "shipped") matchesTab = s === "shipped" || s === "shipping";
      else if (activeTab === "completed") matchesTab = s === "completed" || s === "done";
      else if (activeTab === "paid") matchesTab = s === "paid" || s === "settlement";
      else if (activeTab === "cancelled") matchesTab = s === "cancel" || s === "cancelled" || s === "canceled" || s === "failed";

      if (!matchesTab) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchId = String(o.id).toLowerCase().includes(q);
      const matchProduct = (o.items ?? []).some((it) =>
        (it.productName || it.name || "").toLowerCase().includes(q)
      );

      return matchId || matchProduct;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Pesanan Saya
              </h1>
              {orders && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm">
                  {orders.length} Total
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Pantau status pengiriman, selesaikan pembayaran, dan cek riwayat belanja Anda.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-500" : ""}`} />
            Refresh
          </button>
        </header>

        {/* Stats Metrics Cards */}
        {orders && orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <StatCard
              icon={<ShoppingBag className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
              label="Total Transaksi"
              value={counts.all}
              color="bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-amber-500" />}
              label="Menunggu Bayar"
              value={counts.pending}
              color="bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20"
            />
            <StatCard
              icon={<Truck className="w-5 h-5 text-sky-500" />}
              label="Dalam Pengiriman"
              value={counts.shipped + counts.processing}
              color="bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/20"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              label="Selesai"
              value={counts.paid}
              color="bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20"
            />
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              label="Semua"
              count={counts.all}
            />
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
              label="Menunggu Bayar"
              count={counts.pending}
              dotColor="bg-amber-500"
            />
            <TabButton
              active={activeTab === "processing"}
              onClick={() => setActiveTab("processing")}
              label="Diproses"
              count={counts.processing}
              dotColor="bg-blue-500"
            />
            <TabButton
              active={activeTab === "shipped"}
              onClick={() => setActiveTab("shipped")}
              label="Dikirim"
              count={counts.shipped}
              dotColor="bg-indigo-500"
            />
            <TabButton
              active={activeTab === "paid"}
              onClick={() => setActiveTab("paid")}
              label="Lunas"
              count={counts.paid}
              dotColor="bg-emerald-500"
            />
            <TabButton
              active={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
              label="Selesai"
              count={counts.completed}
              dotColor="bg-emerald-600"
            />
            <TabButton
              active={activeTab === "cancelled"}
              onClick={() => setActiveTab("cancelled")}
              label="Dibatalkan"
              count={counts.cancelled}
              dotColor="bg-rose-500"
            />
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID / nama produk..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <section className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-6 text-center space-y-3">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
              <button
                onClick={fetchOrders}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                Tidak Ada Pesanan Ditemukan
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ada pesanan yang cocok dengan kata kunci "${searchQuery}".`
                  : activeTab !== "all"
                  ? `Anda belum memiliki pesanan dengan status "${activeTab}".`
                  : "Anda belum pernah melakukan pemesanan. Jelajahi katalog produk terbaik kami!"}
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Mulai Belanja Sekarang
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((o) => {
                const itemsList = o.items ?? [];
                const isExpanded = !!expandedOrders[o.id];
                const displayedItems = isExpanded ? itemsList : itemsList.slice(0, 2);
                const hasMore = itemsList.length > 2;

                // Total price calculation
                const finalTotal = o.grandTotal ?? (o.totalPrice ?? 0) + (o.shippingCost ?? 0);

                return (
                  <article
                    key={o.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl shadow-xs transition-all overflow-hidden group"
                  >
                    {/* Card Header */}
                    <div className="bg-slate-50/70 dark:bg-slate-800/40 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 tracking-wide flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>#{o.id}</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatDate(o.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {o.courier && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            {o.courier.toUpperCase()}
                          </span>
                        )}
                        <StatusBadge status={o.status} />
                      </div>
                    </div>

                    {/* Card Body - Products List */}
                    <div className="p-5 space-y-4">
                      {displayedItems.map((it, idx) => {
                        const itemImage = it.product?.image || it.image;
                        const fallback = FALLBACK_IMAGES[(it.productId || idx) % FALLBACK_IMAGES.length];
                        const img = resolveProductImage(itemImage, fallback);
                        const productName = it.productName || it.name || it.product?.name || `Produk #${it.productId}`;

                        return (
                          <div key={it.id ?? `${o.id}-${it.productId}-${idx}`} className="flex items-center gap-4">
                            
                            {/* Product Image Thumbnail */}
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0 shadow-2xs">
                              <Image
                                src={img.src}
                                alt={productName}
                                fill
                                unoptimized={img.unoptimized}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                                {productName}
                              </h3>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {it.quantity} × {currency(it.price)}
                              </p>
                              {o.recipientName && (
                                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 hidden sm:flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  Kirim ke: {o.recipientName} {o.city ? `(${o.city})` : ""}
                                </p>
                              )}
                            </div>

                            {/* Subtotal Item */}
                            <div className="text-right font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                              {currency((it.price ?? 0) * (it.quantity ?? 1))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Expand / Collapse Button if multiple items */}
                      {hasMore && (
                        <button
                          onClick={() => toggleExpand(o.id)}
                          className="w-full py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center justify-center gap-1 transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              Sembunyikan item <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              Lihat {itemsList.length - 2} item lainnya <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="bg-slate-50/50 dark:bg-slate-800/20 px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Total Price summary */}
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold block">
                          Total Pembayaran
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                          {currency(finalTotal)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        {(o.status ?? "").toLowerCase() === "pending" && (
                          <button
                            type="button"
                            disabled={payingOrderId === o.id}
                            onClick={() => handlePay(o.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all disabled:opacity-50"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {payingOrderId === o.id ? "Memproses..." : "Bayar Sekarang"}
                          </button>
                        )}

                        <Link
                          href={`/orders/${o.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors shadow-2xs group/btn"
                        >
                          Lihat Detail
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// Quick Stats Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-2xl border ${color} transition-all flex items-center gap-3.5 shadow-2xs`}>
      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
          {value}
        </div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

// Tab Filter Button Component
function TabButton({
  active,
  onClick,
  label,
  count,
  dotColor,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
        active
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
      }`}
    >
      {dotColor && !active && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
      <span>{label}</span>
      <span
        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
          active
            ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "pending").toLowerCase();

  const config =
    {
      paid: {
        label: "Lunas",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      settlement: {
        label: "Lunas",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      pending: {
        label: "Menunggu Pembayaran",
        icon: <Clock className="w-3.5 h-3.5" />,
        style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      },
      processing: {
        label: "Diproses",
        icon: <PackageCheck className="w-3.5 h-3.5" />,
        style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      },
      process: {
        label: "Diproses",
        icon: <PackageCheck className="w-3.5 h-3.5" />,
        style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      },
      shipped: {
        label: "Dalam Pengiriman",
        icon: <Truck className="w-3.5 h-3.5" />,
        style: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      },
      shipping: {
        label: "Dalam Pengiriman",
        icon: <Truck className="w-3.5 h-3.5" />,
        style: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      },
      completed: {
        label: "Selesai",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      done: {
        label: "Selesai",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      cancel: {
        label: "Dibatalkan",
        icon: <XCircle className="w-3.5 h-3.5" />,
        style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      },
      cancelled: {
        label: "Dibatalkan",
        icon: <XCircle className="w-3.5 h-3.5" />,
        style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      },
      canceled: {
        label: "Dibatalkan",
        icon: <XCircle className="w-3.5 h-3.5" />,
        style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      },
      failed: {
        label: "Gagal",
        icon: <XCircle className="w-3.5 h-3.5" />,
        style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      },
    }[s] ?? {
      label: status ?? "Menunggu",
      icon: <Clock className="w-3.5 h-3.5" />,
      style: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.style}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
