"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getAllOrdersApi, type Order } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  Eye,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";

const LIMIT = 8;
const DEBOUNCE_MS = 400;

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  async function fetchOrders() {
    setLoading(true);
    try {
      const searchValue = statusFilter !== "all" && !debouncedSearch ? statusFilter : debouncedSearch;
      const { data, total } = await getAllOrdersApi({
        page,
        limit: LIMIT,
        search: searchValue,
      });

      setOrders(data);
      setTotal(total);
    } catch (err) {
      console.error("fetch orders error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [page, debouncedSearch, statusFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Kelola Pesanan
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola transaksi masuk, update status pengiriman, dan lacak pembayaran pelanggan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
            Total: {total} Transaksi
          </span>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { key: "all", label: "Semua" },
            { key: "pending", label: "Menunggu" },
            { key: "processing", label: "Diproses" },
            { key: "shipped", label: "Dikirim" },
            { key: "paid", label: "Lunas" },
            { key: "completed", label: "Selesai" },
            { key: "cancelled", label: "Dibatalkan" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari ID / User ID / Status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Total Biaya</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tanggal Pesanan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    Memuat data pesanan...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const grand = o.grandTotal || (o.totalPrice + o.shippingCost);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Order ID */}
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        #{o.id}
                      </td>

                      {/* Customer Info */}
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-200">
                        <div>{o.user?.name ?? `User #${o.userId}`}</div>
                        <div className="text-[10px] text-slate-400">{o.user?.email}</div>
                      </td>

                      {/* Total Price */}
                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                        {currency(grand)}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusBadge status={o.status} />
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-slate-500 font-medium">
                        {formatDate(o.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/orders/${o.id}`}>
                          <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5 rounded-xl">
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 font-medium">
            Halaman <span className="font-bold text-slate-900 dark:text-white">{page}</span> dari{" "}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl text-xs font-bold gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl text-xs font-bold gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Badge Helper
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${config.style}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
