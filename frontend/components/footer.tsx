"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  ShieldCheck,
  Truck,
  HelpCircle,
  Instagram,
  Facebook,
  Twitter,
  Heart,
} from "lucide-react";

export default function Footer() {
  const { user } = useAuth();

  // Jika admin, sembunyikan footer customer
  if (user?.role === "admin") {
    return null;
  }

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="text-2xl font-black text-white tracking-tight">
              Titik<span className="text-blue-500">Apparel</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Brand fashion streetwear lokal dengan standar kualitas internasional. Menggunakan 100% bahan katun murni heavyweight untuk kenyamanan gaya kasual harian Anda.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Navigasi Utama</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-blue-400 transition-colors">
                  Katalog Produk
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-blue-400 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-blue-400 transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Akun & Pesanan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cart" className="hover:text-blue-400 transition-colors">
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-blue-400 transition-colors">
                  Riwayat Pesanan
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-blue-400 transition-colors">
                  Profil Saya
                </Link>
              </li>
              <li>
                <Link href="/profile/security" className="hover:text-blue-400 transition-colors">
                  Ubah Kata Sandi
                </Link>
              </li>
            </ul>
          </div>

          {/* Payments & Logistics */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Metode Pembayaran</h4>
            <p className="text-xs text-slate-400">
              Didukung oleh sistem pembayaran aman Midtrans Snap
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-medium text-slate-300">
                GoPay / QRIS
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-medium text-slate-300">
                BCA Virtual Account
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-medium text-slate-300">
                Mandiri / BNI
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-medium text-slate-300">
                Kartu Kredit
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Titik Apparel. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> untuk pecinta fashion Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
