"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/api/products";
import { uploadImageProduct } from "@/lib/api/image";

type Props = {
  initial?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  submitLabel: string;
};

export default function ProductForm({
  initial = {},
  onSubmit,
  submitLabel,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<Partial<Product>>({
    id: initial.id ?? 0,
    name: initial.name ?? "",
    price: initial.price ?? 0,
    stock: initial.stock ?? 0,
    description: initial.description ?? "",
    image: initial.image ?? undefined,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial.image ? buildImageSrc(initial.image) : null
  );

  const [loading, setLoading] = useState(false);

  /* ---------- helpers ---------- */

  const normalizeUpload = (res: any) => {
    return res?.data?.file?.filename ?? res?.data?.file?.path ?? null;
  };

  function buildImageSrc(img: string | null | undefined) {
    if (!img) return null;

    // 🔥 JANGAN disentuh
    if (img.startsWith("blob:")) {
      return img;
    }

    // full URL
    if (img.startsWith("http://") || img.startsWith("https://")) {
      return img;
    }

    // relative path → prefix API
    const base =
      process.env.NEXT_PUBLIC_API_IMAGE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "";

    if (!base) {
      return `/${img.replace(/^\//, "")}`;
    }

    return `${base.replace(/\/$/, "")}/${img.replace(/^\//, "")}`;
  }

  /* ---------- effects ---------- */

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  /* ---------- handlers ---------- */

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      setImageFile(f);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const productId = form.id ? String(form.id) : undefined;

      // upload image (backend sudah update image)
      if (imageFile && productId) {
        await uploadImageProduct(imageFile, productId);
      }

      // update data TANPA image
      const { image, ...payload } = form;

      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- render ---------- */

  const imgSrc = buildImageSrc(imagePreview);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl bg-white border rounded-lg p-6"
    >
      {/* IMAGE */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Product Image</label>

        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt="Product image preview"
            className="w-32 h-32 object-cover rounded-md border"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-32 h-32 flex items-center justify-center border rounded-md text-xs text-gray-400">
            No Image
          </div>
        )}

        <Input type="file" accept="image/*" onChange={handleImage} />
        <p className="text-xs text-gray-500">JPG / PNG, max 2MB</p>
      </div>

      {/* NAME */}
      <div>
        <label className="text-sm font-medium">Product Name</label>
        <Input name="name" value={form.name} onChange={handleChange} required />
      </div>

      {/* PRICE & STOCK */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Price</label>
          <Input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Stock</label>
          <Input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
          disabled={loading}
        >
          Kembali
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
