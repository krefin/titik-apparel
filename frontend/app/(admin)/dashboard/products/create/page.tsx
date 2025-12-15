"use client";

import { useRouter } from "next/navigation";
import ProductForm from "../_components/productForm";
import { createProduct } from "@/lib/api/products";

export default function CreateProductPage() {
  const router = useRouter();

  async function handleCreate(data: any) {
    await createProduct(data);
    router.push("/dashboard/products");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Add Product</h1>

      <ProductForm submitLabel="Create Product" onSubmit={handleCreate} />
    </div>
  );
}
