// components/products/ProductsPage.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import FilterSidebar from "@/components/products/filter-products"; // sesuaikan path
import { getProducts, Product } from "@/lib/api/products";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/api/cart";
import { resolveProductImage } from "@/lib/image";

export default function ProductsPage({
  initialProducts = [],
}: {
  initialProducts?: Product[];
}) {
  // data state (now supports appending pages)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState<number>(initialProducts.length || 0);

  // loading / error
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // pagination & filter state
  const [page, setPage] = useState<number>(1);
  const limit = 9; // per-page fixed (ubah jika mau)
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");

  const router = useRouter();

  // placeholders
  const placeholders = [
    "https://images.unsplash.com/photo-1521334884684-d80222895322",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  ];

  // debounce search (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // If initialProducts provided (from server), set total if not zero.
  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      // try to set total from initial length until next fetch updates it
      setTotal(initialProducts.length);
      setPage(1); // start at page 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts]);

  // fetch page (page 1 or subsequent)
  async function loadPage(p: number, replace = false) {
    // when replacing (e.g. new search/sort), use `loading`, otherwise `loadingMore`
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
        // append, but avoid duplicates: ensure IDs not already present
        setProducts((prev) => {
          const ids = new Set(prev.map((i) => i.id));
          const filteredNew = data.filter((d) => !ids.has(d.id));
          return [...prev, ...filteredNew];
        });
      }
      setTotal(totalRes);
      setError(null);
    } catch (err: any) {
      console.error("loadPage error:", err);
      setError("Gagal memuat produk");
    } finally {
      if (replace) setLoading(false);
      else setLoadingMore(false);
    }
  }

  // initial load or when search/sort change -> reload page 1 (replace)
  useEffect(() => {
    // reset products and load first page on search/sort change
    let cancelled = false;
    async function reload() {
      if (
        initialProducts.length > 0 &&
        page === 1 &&
        debouncedQuery === "" &&
        sort === "default"
      ) {
        // If we have server initialProducts and no filter, keep them (but still refresh total)
        // still attempt to load page 1 to get total & canonical data
        await loadPage(1, true);
        return;
      }
      if (!cancelled) {
        await loadPage(1, true);
      }
    }
    // reset page pointer to 1
    setPage(1);
    setProducts([]);
    reload();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, sort]);

  // load more when page increments (page>1)
  useEffect(() => {
    if (page === 1) return; // page 1 handled by reload effect
    let cancelled = false;
    async function more() {
      if (!cancelled) await loadPage(page, false);
    }
    more();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // determine hasMore
  const hasMore = products.length < total;

  // infinite scroll: observe sentinel at grid bottom, root is the scrollable main element
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
            // load next page
            setPage((p) => p + 1);
          }
        });
      },
      {
        root, // observe relative to scrollable main
        rootMargin: "300px", // preload a bit earlier
        threshold: 0.1,
      }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loadingMore, loading]);

  // keep same layout as before — main already used as scrollable container earlier
  const headerHeight = 120; // keep as before

  async function handleBuyNow(productId: number) {
    // implementasi pembelian langsung
    const payload = { productId, quantity: 1 };
    // panggil API add to cart di sini
    if (payload.productId) {
      try {
        await addToCart(payload);
        router.push("/cart");
      } catch (err) {
        console.error("Gagal beli langsung:", err);
        alert("Gagal membeli langsung.");
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header (non-scroll) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kumpulan produk terbaru kami — bersih, elegan, dan mudah dicari.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white shadow-sm rounded-md p-2">
            <label className="text-xs text-gray-500">Urutkan:</label>
            <select
              className="text-sm outline-none bg-transparent"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="default">Default</option>
              <option value="asc">Termurah</option>
              <option value="desc">Termahal</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Total: <span className="font-medium text-black">{total}</span>
          </div>
        </div>
      </header>

      {/* Grid: sidebar + main */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

        {/* Main column (scrollable) */}
        <main
          ref={mainRef}
          className="lg:col-span-3 order-1 lg:order-2"
          style={{
            maxHeight: `calc(100vh - ${headerHeight}px)`,
            overflowY: "auto",
            paddingRight: 6,
          }}
        >
          {/* Mobile search (tampil hanya di mobile) */}
          <div className="sm:hidden mb-4">
            <label className="sr-only">Search</label>
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama produk..."
                className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                onClick={() => setQuery("")}
                className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-indigo-600 text-white text-sm shadow"
              >
                Clear
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Pencarian akan dijalankan setelah berhenti mengetik.
            </div>
          </div>

          {/* toolbar mobile */}
          <div className="mb-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-2">
            <div className="sm:hidden w-full">
              <div className="flex items-center gap-2">
                <select
                  className="w-full py-2 px-3 border rounded-md text-sm"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                >
                  <option value="default">Default</option>
                  <option value="asc">Termurah</option>
                  <option value="desc">Termahal</option>
                </select>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Menampilkan{" "}
                <span className="font-medium text-black">
                  {products.length}
                </span>{" "}
                produk
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Memuat produk...
              </div>
            )}

            {!loading && error && (
              <div className="col-span-full text-center py-12 text-red-600">
                Error: {error}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Produk tidak ditemukan.
              </div>
            )}

            {!loading &&
              !error &&
              products.map((p, i) => {
                const { src, unoptimized } = resolveProductImage(
                  p.image,
                  placeholders[i % placeholders.length]
                );
                return (
                  <article
                    key={p.id}
                    className="relative bg-white rounded-2xl overflow-hidden shadow hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-52 sm:h-56">
                      <Image
                        src={src}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={unoptimized}
                        loading="eager"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="text-md font-semibold truncate">
                        {p.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <div className="text-lg font-medium">
                            {formatRupiah(p.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stok: {p.stock}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm shadow-sm"
                            onClick={() => handleBuyNow(p.id ?? 0)}
                          >
                            Buy
                          </button>
                          <button
                            className="px-3 py-2 rounded-md border border-gray-200 text-sm"
                            onClick={() => router.push(`/products/${p.id}`)}
                          >
                            Detail
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-400">
                        Ditambahkan:{" "}
                        {new Date(p.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </article>
                );
              })}

            {/* sentinel untuk intersection observer (invisible) */}
            <div ref={sentinelRef} className="col-span-full h-6" />
          </div>

          {/* loading more indicator */}
          {loadingMore && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Memuat lebih banyak produk...
            </div>
          )}

          {!hasMore && !loading && products.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-400">
              Tidak ada produk lagi.
            </div>
          )}
        </main>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-400">
        Made with care — simple, modern design.
      </footer>
    </div>
  );
}

/* helper */
function formatRupiah(v: number) {
  return v.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
}
