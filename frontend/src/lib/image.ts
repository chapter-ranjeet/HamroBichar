import { getBackendOrigin, getSiteUrl } from "./runtime";

const siteUrl = getSiteUrl();
const backendOrigin = getBackendOrigin();
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const resolveOriginalUrl = (image?: string): string | undefined => {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/uploads/")) return `${backendOrigin}${image}`;
  if (image.startsWith("/")) return `${siteUrl}${image}`;
  return `${siteUrl}/${image}`;
};

export const cloudinaryFetch = (originalUrl?: string | undefined, opts?: { w?: number | string; q?: string; f?: string }) => {
  if (!originalUrl) return undefined;
  if (!cloudName) return originalUrl;
  const width = opts?.w ? `,w_${opts.w}` : "";
  const quality = opts?.q ? `,q_${opts.q}` : ",q_auto";
  const format = opts?.f ? `,f_${opts.f}` : ",f_auto";
  // Cloudinary fetch URL with automatic optimizations
  return `https://res.cloudinary.com/${cloudName}/image/fetch${width}${quality}${format}/${encodeURIComponent(originalUrl)}`;
};
