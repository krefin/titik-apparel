"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "../../_components/productForm";
import {
  getProductById,
  updateProduct,
  type Product,
} from "@/lib/api/products";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProductById(id as string);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function handleUpdate(data: Partial<Product>) {
    await updateProduct(id as string, data);
    router.push("/dashboard/products");
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>

      <ProductForm
        initial={product}
        submitLabel="Update Product"
        onSubmit={handleUpdate}
      />
    </div>
  );
}
