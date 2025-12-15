"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProductById, Product } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      try {
        const data = await getProductById(Number(id));
        if (!cancelled) setProduct(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ?? "Gagal mengambil detail produk."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function formatRupiah(value: number) {
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  }

  async function handleAddToCart() {
    if (!product) return;
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      alert("Produk ditambahkan ke keranjang");
    } catch {
      alert("Gagal menambahkan ke keranjang");
    }
  }

  async function handleBuyNow() {
    if (!product) return;
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      router.push("/cart");
    } catch {
      alert("Gagal membeli produk");
    }
  }

  if (loading) {
    return <div className="py-10 text-center">Memuat detail produk...</div>;
  }

  if (error || !product) {
    return (
      <div className="py-10 text-center text-red-600">
        {error ?? "Produk tidak ditemukan"}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      {/* IMAGE */}
      <div className="relative w-full h-[320px] md:h-[420px] rounded-lg overflow-hidden border">
        <Image
          src={
            product.image ??
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
          }
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* INFO */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>

        <p className="text-xl font-semibold text-primary">
          {formatRupiah(product.price)}
          <span className="ml-3 text-sm text-red-600 line-through">
            {formatRupiah(Math.round(product.price * 1.25))}
          </span>
        </p>

        <p className="text-sm text-gray-600">
          Stok tersedia: <b>{product.stock}</b>
        </p>

        <p className="text-sm text-gray-500">
          Ditambahkan: {new Date(product.createdAt).toLocaleString("id-ID")}
        </p>

        <div className="border-t pt-4">
          <p className="text-sm leading-relaxed text-gray-700">
            {product.description ?? "Deskripsi produk belum tersedia."}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleBuyNow}>Buy Now</Button>
          <Button variant="outline" onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
