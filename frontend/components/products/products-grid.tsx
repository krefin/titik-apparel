"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  image?: string;
};

export default function ProductsGrid() {
  // default ke array agar mudah di-render tanpa banyak null-check
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const placeholders = [
    "https://images.unsplash.com/photo-1521334884684-d80222895322",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  ];

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        // <-- PENTING: destructure { data } sesuai return type getProducts()
        const { data } = await getProducts(); // { data: Product[], total: number }
        if (!cancelled) {
          // pastikan data benar-benar array
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

  function formatRupiah(value: number) {
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  }

  if (loading) return <div className="py-8 text-center">Memuat produk...</div>;

  if (error)
    return <div className="py-8 text-center text-red-600">Error: {error}</div>;

  if (!products.length)
    return <div className="py-8 text-center">Belum ada produk.</div>;

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
    <div className="wrapper flex flex-col sm:flex-row justify-between gap-6 flex-wrap">
      {products.map((p, i) => {
        const img = p.image ?? placeholders[i % placeholders.length];
        return (
          <div
            key={p.id ?? `product-${i}`}
            className="card relative w-full sm:w-[32%] h-[250px] sm:h-[300px] rounded-lg overflow-hidden shadow-lg"
          >
            <div className="relative w-full h-full">
              <Image
                src={img}
                alt={p.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-75 text-black p-3 sm:p-4">
              <h2 className="text-sm sm:text-md md:text-lg font-semibold">
                {p.name}
              </h2>

              <p className="mt-1 mb-2 sm:mb-3 text-sm sm:text-md md:text-lg">
                {formatRupiah(p.price)}
                <span className="text-[10px] sm:text-xs text-red-600 line-through ml-2 sm:ml-3">
                  {formatRupiah(Math.round(p.price * 1.25))}
                </span>
              </p>

              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Stok: {p.stock} • Ditambahkan:{" "}
                {new Date(p.createdAt).toLocaleString("id-ID")}
              </p>

              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <Button
                  className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                  onClick={() => handleBuyNow(p.id ?? 0)}
                >
                  Buy Now
                </Button>
                <Button
                  variant="link"
                  className="text-xs sm:text-sm p-0 sm:p-2"
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
