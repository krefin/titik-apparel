// app/products/page.tsx
import ProductsPage from "@/components/products/products-page";
import { getProducts, type Product } from "@/lib/api/products";

export const metadata = {
  title: "Products",
  description: "Daftar produk — search, filter, sort",
};

async function fetchProductsServer(): Promise<Product[]> {
  const { data } = await getProducts();
  return data ?? [];
}

export default async function Page() {
  const initialProducts = await fetchProductsServer();

  return (
    <main className="min-h-screen bg-gray-50">
      <ProductsPage initialProducts={initialProducts} />
    </main>
  );
}
