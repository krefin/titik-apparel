import Link from "next/link";
import Image from "next/image";
import { HeroCarousel } from "@/components/hero-carousel";
import ProductsGrid from "@/components/products/products-grid";
import { Button } from "@/components/ui/button";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Award,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <HeroCarousel />
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bebas Ongkir</h3>
              <p className="text-xs text-slate-500 mt-0.5">Untuk pembelian di atas Rp 250rb</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bahan Heavyweight</h3>
              <p className="text-xs text-slate-500 mt-0.5">100% Katun murni tebal & tahan lama</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pembayaran Aman</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tersambung langsung dengan Midtrans Snap</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Garansi Tukar Ukuran</h3>
              <p className="text-xs text-slate-500 mt-0.5">Layanan retur mudah dalam 7 hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCTS CATALOG GRID */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ProductsGrid />
      </section>

      {/* 4. PROMOTIONAL FEATURE BANNER */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          {/* Background overlay image */}
          <div className="absolute inset-0 opacity-25">
            <Image
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format&fit=crop&q=80"
              alt="Promo Banner"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="relative z-10 max-w-xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              DISKON HINGGA 30%
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Upgrade Style Kamu Sekarang
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Dapatkan koleksi kaos oversized, hoodie, dan kargo eksklusif buatan lokal dengan standar internasional.
            </p>
            <div className="pt-2 flex justify-center md:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-white hover:bg-slate-100 text-slate-900 rounded-full font-bold px-8 shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
              >
                <Link href="/products">
                  Belanja Koleksi Diskon <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0 w-full md:w-auto flex justify-center">
            <div className="w-64 h-64 sm:w-72 sm:h-72 relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"
                alt="Highlight Product"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
