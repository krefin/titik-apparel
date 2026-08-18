"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProductById, Product } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { resolveProductImage } from "@/lib/image";
import {
  ShoppingCart,
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Minus,
  Plus,
} from "lucide-react";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState("L");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      try {
        const data = await getProductById(Number(id));
        if (!cancelled) setProduct(data);
      } catch (err: unknown) {
        console.error("fetch detail error", err);
        if (!cancelled) {
          setError("Gagal mengambil detail produk.");
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
    return "Rp " + Number(value).toLocaleString("id-ID");
  }

  async function handleAddToCart() {
    if (!product) return;
    try {
      await addToCart({ productId: product.id, quantity });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error("addToCart error", err);
      alert("Silakan login terlebih dahulu.");
      router.push("/auth/user/login");
    }
  }

  async function handleBuyNow() {
    if (!product) return;
    try {
      await addToCart({ productId: product.id, quantity });
      router.push("/cart");
    } catch (err) {
      console.error("buyNow error", err);
      alert("Silakan login terlebih dahulu.");
      router.push("/auth/user/login");
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] container mx-auto px-6 py-16 text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl max-w-md mx-auto">
          {error ?? "Produk tidak ditemukan."}
        </div>
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Produk
        </Link>
      </div>
    );
  }

  const { src, unoptimized } = resolveProductImage(
    product.image,
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
  );

  return (
    <main className="min-h-screen bg-slate-50/50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-slate-900 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-900 transition-colors">Katalog Produk</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Display */}
          <div className="space-y-4">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-inner">
              <Image
                src={src}
                alt={product.name}
                fill
                priority
                className="object-cover object-center"
                unoptimized={unoptimized}
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase">
                  ORIGINAL STREETWEAR
                </span>
              </div>
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  SKU: TITIK-{product.id}00 • Dibuat {new Date(product.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>

              {/* Price & Discount */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-slate-900">
                  {formatRupiah(product.price)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatRupiah(Math.round(product.price * 1.25))}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-bold">
                  HEMAT 20%
                </span>
              </div>

              {/* Description */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Produk</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description || "Bahan cotton heavyweight 24s berkualitas tinggi. Memiliki daya serap keringat yang sangat baik, serat kain halus, tidak panas, serta tahan lama walau dicuci berulang kali."}
                </p>
              </div>

              {/* Size Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">Pilih Ukuran</span>
                  <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Panduan Ukuran</span>
                </div>
                <div className="flex items-center gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-11 rounded-xl font-bold text-xs transition-all ${
                        selectedSize === size
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Jumlah</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 rounded-lg"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-10 text-center text-sm font-bold text-slate-900">{quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 rounded-lg"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Stok tersedia: <strong className="text-slate-900">{product.stock} pcs</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  variant="outline"
                  className={`w-full sm:flex-1 rounded-2xl font-bold py-4 sm:py-6 text-xs sm:text-sm gap-2 border-2 transition-all ${
                    isAdded
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> Ditambahkan
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> + Tambah Keranjang
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 rounded-2xl font-bold py-4 sm:py-6 text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 gap-2"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> Beli Langsung
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Pengiriman Cepat</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Jaminan Ori</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Bisa Retur</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
