"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { useRouter } from "next/navigation";
import { resolveProductImage } from "@/lib/image";
import { ShoppingCart, Eye, Sparkles, Check, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSocketContext } from "@/app/providers/SocketProvider";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  image?: string | null;
  description?: string | null;
};

const CATEGORIES = [
  { id: "all", label: "Semua Produk" },
  { id: "tee", label: "T-Shirt" },
  { id: "hoodie", label: "Hoodie & Sweater" },
  { id: "pants", label: "Celana & Kargo" },
  { id: "accessories", label: "Aksesoris" },
];

export default function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [addedId, setAddedId] = useState<number | null>(null);
  const router = useRouter();
  const { lastStockUpdate } = useSocketContext();

  useEffect(() => {
    if (lastStockUpdate) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === lastStockUpdate.productId ? { ...p, stock: lastStockUpdate.stock } : p
        )
      );
    }
  }, [lastStockUpdate]);

  const placeholders = [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
  ];

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await getProducts();
        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err: unknown) {
        console.error("fetch products error", err);
        if (active) {
          setError("Gagal memuat katalog produk. Silakan coba lagi.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

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
      console.error("Gagal menambahkan ke keranjang", err);
      alert("Silakan login untuk menambahkan ke keranjang.");
      router.push("/auth/user/login");
    }
  }

  // Filter products by selected category tag
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "all") return true;
    const nameLower = p.name.toLowerCase();
    if (selectedCategory === "tee") return nameLower.includes("tee") || nameLower.includes("t-shirt") || nameLower.includes("kaos");
    if (selectedCategory === "hoodie") return nameLower.includes("hoodie") || nameLower.includes("sweat") || nameLower.includes("jacket") || nameLower.includes("jaket");
    if (selectedCategory === "pants") return nameLower.includes("pant") || nameLower.includes("cargo") || nameLower.includes("celana");
    if (selectedCategory === "accessories") return nameLower.includes("bag") || nameLower.includes("cap") || nameLower.includes("topi") || nameLower.includes("tote");
    return true;
  });

  return (
    <section className="space-y-8 py-4">
      {/* Category Filter Chips */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Koleksi Terbaru <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          </h2>
          <p className="text-sm text-slate-500 mt-1">Pilihan streetwear terbaik dengan kualitas material premium</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center text-red-700">
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-lg font-medium">Tidak ada produk dalam kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p, idx) => {
            const { src, unoptimized } = resolveProductImage(
              p.image,
              placeholders[idx % placeholders.length]
            );

            const isJustAdded = addedId === p.id;
            const isLowStock = p.stock > 0 && p.stock <= 10;

            return (
              <div
                key={p.id}
                onClick={() => router.push(`/products/${p.id}`)}
                className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                {/* Product Image & Badges */}
                <div className="relative w-full aspect-square overflow-hidden bg-slate-100">
                  <Image
                    src={src}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    unoptimized={unoptimized}
                  />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider uppercase shadow-md">
                      BEST SELLER
                    </span>
                    {isLowStock && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider uppercase shadow-md">
                        Sisa {p.stock}
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full w-10 h-10 shadow-lg hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/products/${p.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 text-slate-800" />
                    </Button>
                  </div>
                </div>

                {/* Product Meta & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {p.description || "Bahan cotton berkualitas tinggi, cocok untuk penggunaan harian."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold text-slate-900">
                        {formatRupiah(p.price)}
                      </div>
                      <div className="text-[11px] text-slate-400 line-through">
                        {formatRupiah(Math.round(p.price * 1.2))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => handleAddToCart(p.id, e)}
                      className={`rounded-xl text-xs font-semibold gap-1.5 transition-all duration-200 ${
                        isJustAdded
                          ? "bg-emerald-600 hover:bg-emerald-600 text-white"
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
    </section>
  );
}
