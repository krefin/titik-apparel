"use client";

import React from "react";
import { Search, ArrowUpDown, Sparkles, Filter, X } from "lucide-react";

export default function FilterSidebar({
  query,
  setQuery,
  sort,
  setSort,
  total,
}: {
  query: string;
  setQuery: (v: string) => void;
  sort: "default" | "asc" | "desc";
  setSort: (v: "default" | "asc" | "desc") => void;
  total: number;
}) {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24 space-y-6">
        {/* Search Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Search className="w-4 h-4 text-blue-600" />
            Pencarian Produk
          </div>
          <div className="relative">
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-3.5 pr-8 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Ketik kata kunci..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            * Pencarian otomatis diproses setelah jeda ketik (debounce).
          </p>
        </div>

        {/* Filter & Sort Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            <ArrowUpDown className="w-4 h-4 text-blue-600" />
            Urutkan Harga
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between ${
                sort === "default"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setSort("default")}
            >
              <span>Terbaru / Default</span>
              {sort === "default" && <span className="w-2 h-2 rounded-full bg-blue-400" />}
            </button>

            <button
              type="button"
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between ${
                sort === "asc"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setSort("asc")}
            >
              <span>Harga: Termurah</span>
              {sort === "asc" && <span className="w-2 h-2 rounded-full bg-white" />}
            </button>

            <button
              type="button"
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between ${
                sort === "desc"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setSort("desc")}
            >
              <span>Harga: Termahal</span>
              {sort === "desc" && <span className="w-2 h-2 rounded-full bg-white" />}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-1">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Ringkasan
          </div>
          <p className="text-sm font-semibold">
            Menampilkan <span className="text-blue-400 font-black">{total}</span> produk tersedia
          </p>
        </div>
      </div>
    </aside>
  );
}
