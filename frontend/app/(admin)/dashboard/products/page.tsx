"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, deleteProduct, type Product } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { resolveProductImage } from "@/lib/image";

const LIMIT = 5;
const DEBOUNCE_MS = 400;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = Math.ceil(total / LIMIT);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, total } = await getProducts({
        page,
        limit: LIMIT,
        search: debouncedSearch,
      });

      setProducts(data);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1); // reset ke page 1 saat search berubah
      setDebouncedSearch(search.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch]);

  async function handleDelete(id: number) {
    const ok = confirm("Yakin ingin menghapus produk ini?");
    if (!ok) return;

    await deleteProduct(id);
    fetchProducts();
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>

        <Link href="/dashboard/products/create">
          <Button>Add Product</Button>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="flex max-w-sm">
        <Input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 border-b">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  No products found
                </td>
              </tr>
            )}

            {products.map((p) => {
              const { src, unoptimized } = resolveProductImage(p.image);

              return (
                <tr key={p.id} className="border-b hover:bg-neutral-50">
                  {/* IMAGE */}
                  <td className="p-3">
                    {src ? (
                      <div className="relative w-14 h-14 rounded-md overflow-hidden border">
                        <Image
                          src={src}
                          alt={p.name}
                          fill
                          className="object-cover"
                          unoptimized={unoptimized}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 flex items-center justify-center text-xs text-gray-400 border rounded-md">
                        No Image
                      </div>
                    )}
                  </td>

                  {/* NAME */}
                  <td className="p-3 font-medium">{p.name}</td>

                  {/* PRICE */}
                  <td className="p-3">Rp {p.price.toLocaleString("id-ID")}</td>

                  {/* STOCK */}
                  <td className="p-3">{p.stock}</td>

                  {/* CREATED */}
                  <td className="p-3 text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </td>

                  {/* ACTION */}
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/dashboard/products/${p.id}/edit`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
