// app/products/page.tsx
import React from "react";
import ProductsPage from "@/components/products/products-page";
import { getProducts } from "@/lib/api/products";

export const metadata = {
  title: "Products",
  description: "Daftar produk — search, filter, sort",
};

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  image?: string;
};

async function fetchProductsServer(): Promise<Product[]> {
  // Sesuaikan URL jika endpoint internal (mis: `${process.env.API_URL}/products`)
  // Jika menggunakan route internal Next.js (app/api/products/route.ts), gunakan absolute URL or fetch with Next's internal fetch.
  const res = await getProducts();
  if (!res.ok) return [];
  const payload = await res.json();
  return payload?.data ?? [];
}

export default async function Page() {
  const initialProducts = await fetchProductsServer();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ProductsPage harus menerima prop initialProducts dan gunakan sebagai initial state */}
      <ProductsPage initialProducts={initialProducts} />
    </main>
  );
}
