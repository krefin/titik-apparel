"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProducts, deleteProduct, type Product } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveProductImage } from "@/lib/image";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";

const LIMIT = 7;
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
    return format(new Date(dt), "dd MMM yyyy", { locale: idLocale });
  } catch {
    return dt;
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, total } = await getProducts({
        page,
        limit: LIMIT,
        search: debouncedSearch,
      });

      setProducts(data);
      setTotal(total);
    } catch (err) {
      console.error("fetch products error", err);
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
    fetchProducts();
  }, [page, debouncedSearch]);

  async function handleDelete(id: number, name: string) {
    const ok = confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`);
    if (!ok) return;

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert("Gagal menghapus produk. Terjadi kesalahan.");
    }
  }

  // Count low stock products
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Kelola Produk
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tambah, edit, dan atur stok produk fashion Titik Apparel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {lowStockCount} Stok Menipis
            </span>
          )}

          <Link href="/dashboard/products/create">
            <Button className="rounded-xl text-xs font-bold gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md">
              <Plus className="w-4 h-4" /> Tambah Produk
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar: Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="text-slate-900 dark:text-white font-extrabold">{total} Produk</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Foto</th>
                <th className="p-4">Nama Produk</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Tanggal Dibuat</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    Memuat katalog produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const { src, unoptimized } = resolveProductImage(p.image);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                          {src ? (
                            <Image
                              src={src}
                              alt={p.name}
                              fill
                              className="object-cover"
                              unoptimized={unoptimized}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">
                              No Image
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div className="line-clamp-1">{p.name}</div>
                        {p.description && (
                          <div className="text-[11px] font-normal text-slate-400 line-clamp-1 mt-0.5">
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                        {currency(p.price)}
                      </td>

                      {/* Stock Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                            p.stock <= 2
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : p.stock <= 8
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}
                        >
                          {p.stock <= 5 && <AlertTriangle className="w-3 h-3" />}
                          {p.stock} pcs
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 text-slate-500 font-medium">
                        {formatDate(p.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/products/${p.id}/edit`}>
                            <Button size="sm" variant="outline" className="text-xs font-bold gap-1 rounded-xl">
                              <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="text-xs font-bold gap-1 rounded-xl bg-rose-600 hover:bg-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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
