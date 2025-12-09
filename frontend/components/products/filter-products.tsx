"use client";

import React from "react";

/**
 * FilterSidebar.tsx — komponen filter terpisah
 */

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
    <aside className="lg:col-span-1 order-2 lg:order-1">
      <div className="sticky top-6 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-xs text-gray-500">Search</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Cari nama produk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-indigo-600 text-white text-sm shadow"
              onClick={() => setQuery("")}
              aria-label="clear"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-xs text-gray-500">Filter Harga</label>
          <div className="mt-3 flex flex-col gap-2">
            <button
              className={`w-full text-left py-2 px-3 rounded-md text-sm border ${
                sort === "asc"
                  ? "border-indigo-600 bg-indigo-50 font-medium"
                  : "border-gray-100"
              }`}
              onClick={() => setSort("asc")}
            >
              Termurah
            </button>

            <button
              className={`w-full text-left py-2 px-3 rounded-md text-sm border ${
                sort === "desc"
                  ? "border-indigo-600 bg-indigo-50 font-medium"
                  : "border-gray-100"
              }`}
              onClick={() => setSort("desc")}
            >
              Termahal
            </button>

            <button
              className={`w-full text-left py-2 px-3 rounded-md text-sm border ${
                sort === "default"
                  ? "border-indigo-600 bg-indigo-50 font-medium"
                  : "border-gray-100"
              }`}
              onClick={() => setSort("default")}
            >
              Default
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 text-center text-sm text-gray-600">
          <div className="font-medium">Info</div>
          <div className="mt-1 text-xs">
            Total produk:{" "}
            <span className="font-semibold text-black">{total}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
