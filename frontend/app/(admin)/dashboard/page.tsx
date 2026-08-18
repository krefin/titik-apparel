"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import { getAllOrdersApi, type Order } from "@/lib/api/orders";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

type Stats = {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  paidOrders: number;
  revenue: number;
  productsSold: number;
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

function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    return format(new Date(dt), "dd MMM, HH:mm", { locale: idLocale });
  } catch {
    return dt;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats & recent orders in parallel
      const [statsRes, ordersRes] = await Promise.all([
        api.get("/api/admin/stats"),
        getAllOrdersApi({ page: 1, limit: 5 }),
      ]);

      const statsData = statsRes.data?.data ?? statsRes.data ?? null;
      setStats(statsData);
      setRecentOrders(ordersRes.data || []);
    } catch (err: unknown) {
      console.error("fetch stats error", err);
      setError(getErrorMessage(err, "Gagal memuat statistik dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Admin Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang Kembali, Admin! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Pantau pertumbuhan penjualan, stok inventaris, serta transaksi pelanggan secara real-time dari satu tempat.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/dashboard/products/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Link>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Kelola Pesanan
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="px-3 py-1 bg-rose-600 text-white text-xs rounded-lg font-bold">
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue Card */}
          <KpiCard
            title="Total Revenue"
            value={currency(stats?.revenue ?? 0)}
            icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
            badge="Pendapatan Bersih"
            badgeColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            borderGlow="border-emerald-500/20"
          />

          {/* Total Orders Card */}
          <KpiCard
            title="Total Pesanan"
            value={(stats?.totalOrders ?? 0).toString()}
            subtitle={`${stats?.paidOrders ?? 0} pesanan lunas`}
            icon={<ShoppingCart className="w-6 h-6 text-amber-500" />}
            badge="Transaksi"
            badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            borderGlow="border-amber-500/20"
          />

          {/* Total Products Card */}
          <KpiCard
            title="Katalog Produk"
            value={(stats?.totalProducts ?? 0).toString()}
            subtitle={`${stats?.productsSold ?? 0} unit terjual`}
            icon={<Package className="w-6 h-6 text-sky-500" />}
            badge="Inventaris"
            badgeColor="bg-sky-500/10 text-sky-600 dark:text-sky-400"
            borderGlow="border-sky-500/20"
          />

          {/* Total Users Card */}
          <KpiCard
            title="Total Pengguna"
            value={(stats?.totalUsers ?? 0).toString()}
            subtitle="Pelanggan terdaftar"
            icon={<Users className="w-6 h-6 text-indigo-500" />}
            badge="Pengguna"
            badgeColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            borderGlow="border-indigo-500/20"
          />
        </div>
      )}

      {/* Secondary Section: Recent Orders & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Live Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-500" />
                Pesanan Terkini (Live Feed)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Transaksi terbaru yang masuk ke toko Anda.
              </p>
            </div>

            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
            >
              Semua Pesanan <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] text-left">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Pelanggan</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Waktu</th>
                  <th className="py-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada pesanan terbaru.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-900 dark:text-slate-100">
                        #{o.id}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300 font-medium">
                        {o.user?.name ?? `User #${o.userId}`}
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                        {currency(o.grandTotal || o.totalPrice)}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3 px-2 text-slate-400">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Insights & Actions (1 col) */}
        <div className="space-y-6">
          
          {/* Quick Metrics Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Performa Penjualan
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Pesanan Terbayar</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {stats?.paidOrders ?? 0} Order
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Item Produk Terjual</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {stats?.productsSold ?? 0} Pcs
                </span>
              </div>
            </div>
          </div>

          {/* Admin Quick Action Shortcuts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Akses Cepat Admin
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/dashboard/products/create"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col gap-2 transition-all group"
              >
                <Plus className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
                Tambah Produk Baru
              </Link>
              <Link
                href="/dashboard/orders"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col gap-2 transition-all group"
              >
                <ShoppingCart className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                Kelola Pesanan
              </Link>
              <Link
                href="/dashboard/products"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col gap-2 transition-all group"
              >
                <Package className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                Cek Stok Produk
              </Link>
              <Link
                href="/dashboard/users"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col gap-2 transition-all group"
              >
                <Users className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                Kelola User Admin
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// KPI Metric Card Component
function KpiCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgeColor,
  borderGlow,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  borderGlow: string;
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 border ${borderGlow} rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:shadow-md group`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeColor}`}>
          {badge}
        </span>
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          {value}
        </div>
        {subtitle && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// Status Badge Helper
function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "pending").toLowerCase();
  const config =
    {
      paid: { label: "Lunas", style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      settlement: { label: "Lunas", style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      pending: { label: "Menunggu", style: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      processing: { label: "Diproses", style: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      shipped: { label: "Dikirim", style: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
      cancel: { label: "Dibatalkan", style: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
      cancelled: { label: "Dibatalkan", style: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
    }[s] ?? { label: status ?? "Pending", style: "bg-slate-500/10 text-slate-600 border-slate-500/20" };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.style}`}>
      {config.label}
    </span>
  );
}
