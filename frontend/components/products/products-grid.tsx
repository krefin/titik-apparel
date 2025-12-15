"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { useRouter } from "next/navigation";
import { CloudHail } from "lucide-react";
import { resolveProductImage } from "@/lib/image";

/* =========================
   TYPES
========================= */
type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  image?: string | null;
};

/* =========================
   COMPONENT
========================= */
export default function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /* fallback image jika produk tidak punya gambar */
  const placeholders = [
    "https://images.unsplash.com/photo-1521334884684-d80222895322",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  ];

  /* =========================
     FETCH PRODUCTS
  ========================= */
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const { data } = await getProducts();
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(
            err?.response?.data?.message ?? "Gagal mengambil data produk."
          );
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================
     HELPERS
  ========================= */
  function formatRupiah(value: number) {
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  }

  async function handleBuyNow(productId: number) {
    try {
      await addToCart({ productId, quantity: 1 });
      router.push("/cart");
    } catch (err) {
      console.error("Gagal beli langsung:", err);
      alert("Gagal membeli langsung.");
    }
  }

  /* =========================
     STATES
  ========================= */
  if (loading) return <div className="py-8 text-center">Memuat produk...</div>;

  if (error)
    return <div className="py-8 text-center text-red-600">Error: {error}</div>;

  if (!products.length)
    return <div className="py-8 text-center">Belum ada produk.</div>;

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="wrapper flex flex-col sm:flex-row justify-between gap-6 flex-wrap">
      {products.map((p, i) => {
        const { src, unoptimized } = resolveProductImage(
          p.image,
          placeholders[i % placeholders.length]
        );

        return (
          <div
            key={p.id}
            className="card relative w-full sm:w-[32%] h-[250px] sm:h-[300px] rounded-lg overflow-hidden shadow-lg"
          >
            {/* IMAGE */}
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt={`Image ${p.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
                unoptimized={unoptimized}
                loading="eager"
              />
            </div>

            {/* CONTENT */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-black p-3 sm:p-4">
              <h2 className="text-sm sm:text-md md:text-lg font-semibold">
                {p.name}
              </h2>

              <p className="mt-1 mb-2 sm:mb-3 text-sm sm:text-md md:text-lg">
                {formatRupiah(p.price)}
                <span className="text-[10px] sm:text-xs text-red-600 line-through ml-2">
                  {formatRupiah(Math.round(p.price * 1.25))}
                </span>
              </p>

              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Stok: {p.stock} •{" "}
                {new Date(p.createdAt).toLocaleString("id-ID")}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  className="text-xs sm:text-sm"
                  onClick={() => handleBuyNow(p.id)}
                >
                  Buy Now
                </Button>

                <Button
                  variant="link"
                  className="text-xs sm:text-sm p-0"
                  onClick={() => router.push(`/products/${p.id}`)}
                >
                  Detail
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
