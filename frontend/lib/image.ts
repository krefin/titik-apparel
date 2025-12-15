export function resolveProductImage(
  image?: string | null,
  fallback?: string
): { src: string; unoptimized: boolean } {
  // fallback
  if (!image || !image.trim()) {
    return {
      src: fallback ?? "",
      unoptimized: false,
    };
  }

  // already absolute URL (unsplash, cdn, etc)
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return {
      src: image,
      unoptimized: false,
    };
  }

  // local backend image
  const base = process.env.NEXT_PUBLIC_API_IMAGE_URL;
  if (!base) {
    return {
      src: fallback ?? "",
      unoptimized: false,
    };
  }

  return {
    src: `${base.replace(/\/$/, "")}/${image.replace(/^\//, "")}`,
    unoptimized: true, // 🔑 ini kunci utama
  };
}
