import React from "react";
// import Image from "next/image";
import Link from "next/link";

// jika Anda menggunakan shadcn/ui, komponen Card/Button bisa diimpor seperti ini
// kalau belum tersedia, komponen tersebut tidak diperlukan — Tailwind sudah cukup
import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          {/* Left: teks */}
          <div className="w-full lg:w-1/2">
            <span className="inline-flex items-center gap-3 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-sm font-medium">
              About • TitikApparel
            </span>

            <h1 className="mt-6 text-4xl lg:text-5xl font-extrabold leading-tight">
              TitikApparel — E‑commerce pakaian yang mengutamakan kualitas &
              pengalaman
            </h1>

            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              TitikApparel adalah platform e‑commerce yang diciptakan untuk
              membantu pelanggan menemukan pakaian berkualitas dengan cara yang
              cepat, aman, dan menyenangkan. Kami menggabungkan kurasi produk,
              proses pembayaran yang sederhana, dan dukungan pelanggan proaktif
              — sehingga belanja terasa lebih mudah.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center px-5 py-3 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow"
              >
                Belanja Sekarang
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-5 py-3 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Hubungi Kami
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat label="Produk Terpercaya" value="1.2k+" />
              <Stat label="Pengiriman" value="100+ Kota" />
              <Stat label="Rating Pelanggan" value="4.8/5" />
            </div>

            <blockquote className="mt-8 border-l-4 border-slate-100 dark:border-slate-700 pl-4 italic text-slate-600 dark:text-slate-300">
              &quot;Kualitas bahan dan kemudahan proses checkout membuat saya
              kembali belanja di TitikApparel.&quot; — Pelanggan setia
            </blockquote>
          </div>

          {/* Right: ilustrasi / card */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <Card className="max-w-md w-full shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-linear-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                    TA
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Kenapa memilih TitikApparel?
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Kami memilih produk dengan standar tinggi dan memberikan
                      layanan yang cepat serta transparan.
                    </p>
                  </div>
                </div>

                <ul className="mt-6 grid gap-3">
                  <li className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 11L9 13L13 7"
                        stroke="#10B981"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      Kurasi produk oleh tim ahli
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12L8 15L15 6"
                        stroke="#10B981"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      Pembayaran aman & metode lengkap
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12L8 15L15 6"
                        stroke="#10B981"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      Dukungan pelanggan cepat
                    </span>
                  </li>
                </ul>

                <div className="mt-6 border-t pt-4">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Siap mencoba?
                  </div>
                  <div className="mt-3 flex gap-3">
                    <Link
                      href="/shop"
                      className="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      Mulai Berbelanja
                    </Link>
                    <Link
                      href="/faq"
                      className="inline-flex items-center px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      Lihat FAQ
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section: mission & values */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-semibold">Misi kami</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl">
              Memberi akses kepada pakaian berkualitas dengan pengalaman belanja
              yang nyaman, layanan cepat, dan transparansi penuh — dari
              pemilihan produk hingga pengiriman.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Feature
                title="Kualitas Terjamin"
                desc="Inspeksi produk sebelum dikirim, foto nyata produk."
              />
              <Feature
                title="Pengiriman Cepat"
                desc="Layanan pengiriman yang cepat dan dapat dilacak."
              />
              <Feature
                title="Retur Mudah"
                desc="Kebijakan retur yang adil dan proses sederhana."
              />
              <Feature
                title="Pembayaran Aman"
                desc="Integrasi gateway pembayaran terpercaya."
              />
            </div>
          </div>

          <aside className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold">Statistik singkat</h3>
            <div className="mt-4 grid gap-3">
              <MiniStat label="Total Pesanan" value="12.345" />
              <MiniStat label="Pelanggan Aktif" value="8.910" />
              <MiniStat label="Rating Rata-rata" value="4.8" />
            </div>
          </aside>
        </section>

        {/* Footer CTA */}
        <section className="mt-12 bg-linear-to-r from-sky-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold">
              Siap menemukan koleksi favorit Anda?
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Kunjungi toko kami dan nikmati pengalaman belanja yang
              dipersonalisasi.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center px-5 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Mulai Belanja
            </Link>
            <Link
              href="/subscribe"
              className="inline-flex items-center px-5 py-3 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              Berlangganan
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div className="text-sm text-slate-500 dark:text-slate-300">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-100 dark:border-slate-800">
      <div className="text-sm text-slate-500 dark:text-slate-300">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
