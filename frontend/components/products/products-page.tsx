// components/products/products-page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import FilterSidebar from "@/components/products/filter-products";
import { getProducts, Product } from "@/lib/api/products";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/api/cart";
import { resolveProductImage } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Sparkles, Check, Search, SlidersHorizontal } from "lucide-react";

export default function ProductsPage({
  initialProducts = [],
}: {
  initialProducts?: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState<number>(initialProducts.length || 0);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const limit = 12;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");
  const [addedId, setAddedId] = useState<number | null>(null);

  const router = useRouter();

  const placeholders = [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 600);
    return () => clearTimeout(t);
  }, [query]);

  async function loadPage(p: number, replace = false) {
    if (replace) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getProducts({
        page: p,
        limit,
        search: debouncedQuery || undefined,
        sort: sort === "default" ? undefined : (sort as "asc" | "desc"),
      });

      const data = res?.data ?? [];
      const totalRes = Number(res?.total ?? data.length ?? 0);

      if (replace) {
        setProducts(data);
        setPage(1);
      } else {
        setProducts((prev) => {
          const ids = new Set(prev.map((i) => i.id));
          const filteredNew = data.filter((d) => !ids.has(d.id));
          return [...prev, ...filteredNew];
        });
      }
      setTotal(totalRes);
      setError(null);
    } catch (err: unknown) {
      console.error("loadPage error:", err);
      setError("Gagal memuat katalog produk.");
    } finally {
      if (replace) setLoading(false);
      else setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, sort]);

  const hasMore = products.length < total;
  const mainRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = mainRef.current;
    if (!sentinel || !root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
            setPage((p) => p + 1);
          }
        });
      },
      { root, rootMargin: "200px", threshold: 0.1 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    if (page === 1) return;
    loadPage(page, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function formatRupiah(value: number) {
    return "Rp " + Number(value).toLocaleString("id-ID");
  }

  async function handleAddToCart(productId: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      setAddedId(productId);
      await addToCart({ productId, quantity: 1 });
      setTimeout(() => setAddedId(null), 1500);
    } catch (err) {
      console.error(err);
      alert("Silakan login untuk menambahkan ke keranjang.");
      router.push("/auth/user/login");
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            KATALOG LENGKAP
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Koleksi Streetwear Original</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Temukan pakaian kasual berkualitas tinggi, desain oversized modern, dan katun tebal 24s.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700 w-full sm:w-auto justify-between">
          <div className="text-xs text-slate-400">
            Total Produk: <strong className="text-white font-bold">{total}</strong>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Urutkan:</label>
            <select
              className="text-xs bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-700 font-semibold outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value as "default" | "asc" | "desc")}
            >
              <option value="default">Terbaru</option>
              <option value="asc">Harga Termurah</option>
              <option value="desc">Harga Termahal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: sidebar + main */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar column */}
        <div className="order-2 lg:order-1">
          <FilterSidebar
            query={query}
            setQuery={setQuery}
            sort={sort}
            setSort={setSort}
            total={total}
          />
        </div>

        {/* Main column */}
        <main ref={mainRef} className="lg:col-span-3 order-1 lg:order-2 space-y-6">
          {/* Product grid */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
              <p className="text-lg font-bold text-slate-800">Produk tidak ditemukan</p>
              <p className="text-xs text-slate-500">Coba ganti kata kunci pencarian Anda.</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, idx) => {
                const { src, unoptimized } = resolveProductImage(
                  p.image,
                  placeholders[idx % placeholders.length]
                );
                const isJustAdded = addedId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/products/${p.id}`)}
                    className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                  >
                    {/* Product Image */}
                    <div className="relative w-full aspect-square overflow-hidden bg-slate-100">
                      <Image
                        src={src}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        unoptimized={unoptimized}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase">
                          PREMIUM
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Stok: {p.stock} pcs</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-base font-bold text-slate-900">{formatRupiah(p.price)}</div>
                          <div className="text-[11px] text-slate-400 line-through">
                            {formatRupiah(Math.round(p.price * 1.2))}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => handleAddToCart(p.id, e)}
                          className={`rounded-xl text-xs font-semibold gap-1.5 transition-all ${
                            isJustAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Ditambah
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" /> +Keranjang
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <div className="py-4 text-center text-xs text-slate-500 font-medium">
              Memuat lebih banyak produk...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
