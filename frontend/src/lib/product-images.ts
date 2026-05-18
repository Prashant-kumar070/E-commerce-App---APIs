import type { Product } from "@/lib/types";

const API_ORIGIN =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "")) ||
  "http://127.0.0.1:8000";

function absolutizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return url;
}

export function getProductImageUrl(product: Product | null | undefined): string | null {
  if (!product) return null;
  if (product.image_url) return absolutizeImageUrl(product.image_url);
  const images = product.images;
  if (!images?.length) return null;
  const primary = images.find((img) => img.is_primary);
  return absolutizeImageUrl((primary ?? images[0]).url);
}
