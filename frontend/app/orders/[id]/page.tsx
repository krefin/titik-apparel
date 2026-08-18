"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import { getOrderByIdApi, type Order, type OrderItem } from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/errors";
import { resolveProductImage } from "@/lib/image";
import { processOrderPayment } from "@/lib/payment";
import {
  ArrowLeft,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  MapPin,
  User,
  Phone,
  FileText,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";

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
    return format(new Date(dt), "dd MMMM yyyy, HH:mm", { locale: idLocale });
  } catch {
    return dt;
  }
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderByIdApi(params.id);
      setOrder(data);
    } catch (err: unknown) {
      console.error("fetch order detail error", err);
      setError(getErrorMessage(err, "Gagal mengambil detail pesanan"));
    } fontally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    await processOrderPayment(order.id, () => {
      setPaying(false);
      fetchOrder();
    });
    setPaying(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
          <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-semibold">
            {error ?? "Pesanan tidak ditemukan."}
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </main>
    );
  }

  const items: OrderItem[] = order.items ?? [];
  const status = (order.status ?? "pending").toLowerCase();
  const isCancelled = status === "cancelled" || status === "cancel" || status === "failed";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pesanan Saya
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Package className="w-5 h-5" />
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Detail Pesanan #{order.id}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dibuat pada {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <StatusBadge status={order.status} />
            </div>
          </div>

          {/* Timeline Order Progress Bar (If not cancelled) */}
          {!isCancelled && (
            <div className="pt-2">
              <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-6">
                Status Pelacakan Pesanan
              </h2>
              <OrderTimeline currentStatus={status} />
            </div>
          )}
        </div>

        {/* Grid Layout: Items & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Products List & Price Breakdown (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Items Card */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                Rincian Produk ({items.length} Item)
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((it, idx) => {
                  const itemImage = it.product?.image || it.image;
                  const fallback = FALLBACK_IMAGES[(it.productId || idx) % FALLBACK_IMAGES.length];
                  const img = resolveProductImage(itemImage, fallback);
                  const name = it.productName || it.name || it.product?.name || `Produk #${it.productId}`;

                  return (
                    <div key={it.id ?? `${it.productId}-${idx}`} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0 shadow-2xs">
                        <Image
                          src={img.src}
                          alt={name}
                          fill
                          unoptimized={img.unoptimized}
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                          {name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {it.quantity} × {currency(it.price)}
                        </p>
                      </div>

                      <div className="text-right font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {currency((it.price ?? 0) * (it.quantity ?? 1))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Produk</span>
                  <span>{currency(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Biaya Pengiriman ({order.courier ? order.courier.toUpperCase() : "Kurir"})</span>
                  <span>{currency(order.shippingCost)}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                  <span>Total Pembayaran</span>
                  <span className="text-sky-600 dark:text-sky-400">
                    {currency(order.grandTotal || (order.totalPrice + order.shippingCost))}
                  </span>
                </div>
              </div>
            </section>

            {/* Payment Section Card */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                Informasi Pembayaran
              </h2>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400 font-medium">Metode Pembayaran</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {order.paymentMethod ? order.paymentMethod.toUpperCase() : "Midtrans Gateway"}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {status === "pending" && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Pembayaran Anda belum diselesaikan. Segera selesaikan sebelum pesanan kedaluwarsa.</span>
                  </div>
                  <button
                    type="button"
                    disabled={paying}
                    onClick={handlePay}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {paying ? "Memproses Pembayaran..." : "Bayar Sekarang"}
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Shipping & Delivery Info (1 col) */}
          <div className="space-y-6">
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                Informasi Pengiriman
              </h2>

              <div className="space-y-4 text-xs">
                {order.recipientName && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400 font-medium">Penerima</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {order.recipientName}
                      </div>
                    </div>
                  </div>
                )}

                {order.telephone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400 font-medium">No. Telepon</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {order.telephone}
                      </div>
                    </div>
                  </div>
                )}

                {order.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400 font-medium">Alamat Lengkap</div>
                      <div className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                        {order.address}
                        {order.city ? `, ${order.city}` : ""}
                        {order.postalCode ? ` ${order.postalCode}` : ""}
                      </div>
                    </div>
                  </div>
                )}

                {order.courier && (
                  <div className="flex items-start gap-3">
                    <Truck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400 font-medium">Ekspedisi</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {order.courier.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="flex items-start gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400 font-medium">Catatan Pesanan</div>
                      <div className="font-medium text-slate-600 dark:text-slate-400 italic">
                        "{order.notes}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Help & Support Card */}
            <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-bold text-sky-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Bantuan & Garansi</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ada kendala pada pesanan Anda? Tim customer support Titik Apparel siap membantu 24/7.
              </p>
              <Link
                href="/kontak"
                className="inline-block text-xs font-semibold text-white underline hover:text-sky-300 transition-colors pt-1"
              >
                Hubungi Customer Support →
              </Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

// Order Progress Timeline Step Bar Component
function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { key: "pending", label: "Pesanan Dibuat", icon: Clock },
    { key: "paid", label: "Pembayaran Lunas", icon: CreditCard },
    { key: "processing", label: "Diproses", icon: PackageCheck },
    { key: "shipped", label: "Dalam Pengiriman", icon: Truck },
    { key: "completed", label: "Selesai", icon: CheckCircle2 },
  ];

  // Determine current step index
  let activeIndex = 0;
  if (currentStatus === "paid" || currentStatus === "settlement") activeIndex = 1;
  else if (currentStatus === "processing" || currentStatus === "process") activeIndex = 2;
  else if (currentStatus === "shipped" || currentStatus === "shipping") activeIndex = 3;
  else if (currentStatus === "completed" || currentStatus === "done") activeIndex = 4;

  return (
    <div className="relative flex items-center justify-between">
      {/* Progress Bar Line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 -z-0 rounded-full" />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-slate-900 to-sky-500 dark:from-white dark:to-sky-400 transition-all duration-500 rounded-full -z-0"
        style={{
          width: `${(activeIndex / (steps.length - 1)) * 100}%`,
        }}
      />

      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isPassed = idx <= activeIndex;
        const isCurrent = idx === activeIndex;

        return (
          <div key={step.key} className="relative z-10 flex flex-col items-center group">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                isPassed
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md ring-4 ring-white dark:ring-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span
              className={`mt-2 text-[10px] sm:text-xs font-semibold text-center hidden sm:block max-w-[80px] ${
                isCurrent
                  ? "text-slate-900 dark:text-white font-extrabold"
                  : isPassed
                  ? "text-slate-700 dark:text-slate-300"
                  : "text-slate-400 dark:text-slate-600"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
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
      shipped: {
        label: "Dalam Pengiriman",
        icon: <Truck className="w-3.5 h-3.5" />,
        style: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.style}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
