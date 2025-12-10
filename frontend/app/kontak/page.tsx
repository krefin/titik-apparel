"use client";

import React, { useState } from "react";
import Link from "next/link";

// Jika Anda menggunakan shadcn/ui, ganti elemen HTML standar dengan komponen Button/Input/Textarea
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<
    null | "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // simple client-side validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Format email tidak valid.");
      return;
    }

    try {
      setStatus("sending");

      // Contoh: kirim ke API route /api/kontak (implementasikan sendiri di backend)
      const res = await fetch("/api/kontak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Gagal mengirim pesan.");

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(err?.message ?? "Terjadi kesalahan saat mengirim pesan.");
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl lg:text-4xl font-extrabold">Hubungi Kami</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Ada pertanyaan seputar TitikApparel? Tim kami siap membantu. Isi
            formulir di bawah atau gunakan detail kontak alternatif.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact card */}
          <div className="md:col-span-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-semibold">Informasi Kontak</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                TitikApparel — Layanan pelanggan
              </p>
            </div>

            <div className="text-sm text-slate-700 dark:text-slate-200">
              <div className="flex items-start gap-3">
                <span className="font-medium w-24">Email</span>
                <a
                  href="mailto:support@titikapparel.example"
                  className="text-sky-600 hover:underline"
                >
                  support@titikapparel.example
                </a>
              </div>

              <div className="flex items-start gap-3 mt-2">
                <span className="font-medium w-24">Telepon</span>
                <a href="tel:+628123456789" className="hover:underline">
                  +62 812-3456-789
                </a>
              </div>

              <div className="flex items-start gap-3 mt-2">
                <span className="font-medium w-24">Jam</span>
                <div>
                  <div>Senin — Jumat: 09:00 — 17:00</div>
                  <div>Sabtu: 10:00 — 14:00</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium">Alamat</h4>
              <address className="not-italic text-sm text-slate-600 dark:text-slate-300 mt-1">
                Jl. Contoh No.12, Kecamatan, Kota — Indonesia
              </address>
            </div>

            <div className="mt-auto">
              <Link
                href="/faq"
                className="inline-block px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm"
              >
                FAQ & Bantuan
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Nama
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    placeholder="Nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Pesan
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="Tulis pertanyaan atau pesan Anda di sini"
                  required
                />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}
              {status === "success" && (
                <div className="text-sm text-green-600">
                  Pesan berhasil dikirim. Tim kami akan menghubungi Anda segera.
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Mengirim..." : "Kirim Pesan"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm({ name: "", email: "", message: "" });
                    setError(null);
                    setStatus("idle");
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm"
                >
                  Reset
                </button>
              </div>
            </form>

            <div className="mt-6">
              <h4 className="font-medium">Lokasi kami</h4>
              <div className="mt-3 rounded-md overflow-hidden border border-slate-100 dark:border-slate-800">
                {/* Placeholder map - ganti dengan embed Google Maps jika perlu */}
                <div className="w-full h-48 bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-sm text-slate-500">
                  Peta lokasi (embed Google Maps di sini)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
