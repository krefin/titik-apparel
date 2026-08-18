"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import {
  getOrderByIdApi,
  updateOrderStatusApi,
  type Order,
  type OrderItem,
} from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/errors";
import { resolveProductImage } from "@/lib/image";
import {
  ArrowLeft,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  PackageCheck,
  Check,
} from "lucide-react";

const STATUS_OPTIONS = [
  { key: "pending", label: "Menunggu" },
  { key: "paid", label: "Lunas" },
  { key: "process", label: "Diproses" },
  { key: "shipping", label: "Dikirim" },
  { key: "completed", label: "Selesai" },
  { key: "canceled", label: "Dibatalkan" },
] as const;

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

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderByIdApi(params.id);
      setOrder(data);
    } catch (err: unknown) {
      console.error("fetch order detail error", err);
      setError(getErrorMessage(err, "Gagal mengambil detail pesanan"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function changeStatus(status: string) {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateOrderStatusApi(params.id, status);
      setOrder((prev) => (prev ? { ...prev, ...(updated ?? {}), status } : prev));
      setMessage(`Status pesanan berhasil diperbarui ke ${status.toUpperCase()}`);
    } catch (err: unknown) {
      console.error("update status error", err);
      setError(getErrorMessage(err, "Gagal memperbarui status"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-medium">
        Memuat detail pesanan...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4 max-w-xl mx-auto text-center">
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-6 text-rose-600 dark:text-rose-400 text-sm font-semibold">
          {error ?? "Pesanan tidak ditemukan."}
        </div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke daftar pesanan
        </Link>
      </div>
    );
  }

  const items: OrderItem[] = order.items ?? [];

  return (
    <div className="space-y-6">
      
      {/* Navigation */}
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pesanan
        </Link>
      </div>

      {/* Order Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Pesanan #{order.id}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dibuat pada {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Admin Action Bar: Update Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Ubah Status Pesanan Ini
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = (order.status ?? "").toLowerCase() === opt.key;

            return (
              <button
                key={opt.key}
                type="button"
                disabled={saving || isSelected}
                onClick={() => changeStatus(opt.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${
                  isSelected
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {opt.label}
              </button>
            );
          })}
        </div>

        {message && (
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            {message}
          </p>
        )}
      </div>

      {/* Grid: Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Products & Price (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Customer Info Card */}
          {order.user && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold flex items-center justify-center text-lg shrink-0">
                {order.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Informasi Pelanggan
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {order.user.name}
                </div>
                <div className="text-xs text-slate-500 font-medium truncate">
                  {order.user.email} (User ID: #{order.user.id})
                </div>
              </div>
            </div>
          )}

          {/* Items Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              Item Pesanan ({items.length})
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((it, idx) => {
                const itemImage = it.product?.image || it.image;
                const fallback = FALLBACK_IMAGES[(it.productId || idx) % FALLBACK_IMAGES.length];
                const img = resolveProductImage(itemImage, fallback);
                const name = it.productName || it.name || it.product?.name || `Produk #${it.productId}`;

                return (
                  <div key={it.id ?? `${it.productId}-${idx}`} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                      <Image src={img.src} alt={name} fill unoptimized={img.unoptimized} className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 font-medium">
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

            {/* Total Breakdown */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Produk</span>
                <span>{currency(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Ongkos Kirim</span>
                <span>{currency(order.shippingCost)}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-sky-600 dark:text-sky-400">
                  {currency(order.grandTotal || (order.totalPrice + order.shippingCost))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shipping & Payment (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              Detail Pengiriman
            </h2>

            <div className="space-y-3.5 text-xs">
              {order.recipientName && (
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-medium">Penerima</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{order.recipientName}</div>
                  </div>
                </div>
              )}

              {order.telephone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-medium">Telepon</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{order.telephone}</div>
                  </div>
                </div>
              )}

              {order.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-medium">Alamat</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {order.address} {order.city ? `, ${order.city}` : ""} {order.postalCode ? ` ${order.postalCode}` : ""}
                    </div>
                  </div>
                </div>
              )}

              {order.courier && (
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-medium">Ekspedisi</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{order.courier.toUpperCase()}</div>
                  </div>
                </div>
              )}

              {order.paymentMethod && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-medium">Pembayaran</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{order.paymentMethod.toUpperCase()}</div>
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-medium">Catatan</div>
                    <div className="font-medium text-slate-600 dark:text-slate-400 italic">"{order.notes}"</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "pending").toLowerCase();
  const config =
    {
      paid: { label: "Lunas", icon: CheckCircle2, style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      settlement: { label: "Lunas", icon: CheckCircle2, style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      pending: { label: "Menunggu", icon: Clock, style: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      processing: { label: "Diproses", icon: PackageCheck, style: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      process: { label: "Diproses", icon: PackageCheck, style: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      shipped: { label: "Dikirim", icon: Truck, style: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
      shipping: { label: "Dikirim", icon: Truck, style: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
      completed: { label: "Selesai", icon: CheckCircle2, style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      done: { label: "Selesai", icon: CheckCircle2, style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      cancel: { label: "Dibatalkan", icon: XCircle, style: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
      cancelled: { label: "Dibatalkan", icon: XCircle, style: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
      canceled: { label: "Dibatalkan", icon: XCircle, style: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
    }[s] ?? { label: status ?? "Pending", icon: Clock, style: "bg-slate-500/10 text-slate-600 border-slate-500/20" };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.style}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
