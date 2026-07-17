// Cloudinary unsigned upload with client-side compression and progress callback.
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dcoimqij";
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "levelupingup";

export type CloudinaryUpload = { url: string; publicId: string };
export type UploadFolder = "swamy/properties" | "swamy/blog" | "swamy/gallery" | "swamy/testimonials" | "swamy/team" | "swamy/hero";

export const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function isImage(file: File) {
  return file.type.startsWith("image/");
}

// Compress oversized images on the client (canvas) before upload.
export async function compressImage(file: File, maxSize = MAX_SIZE_BYTES, maxDim = 2400): Promise<File> {
  if (!isImage(file) || file.size <= maxSize) return file;
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  let quality = 0.85;
  let blob: Blob | null = null;
  for (let i = 0; i < 5; i++) {
    blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
    if (blob && blob.size <= maxSize) break;
    quality -= 0.15;
  }
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

export function uploadToCloudinary(
  file: File,
  folder: UploadFolder,
  onProgress?: (pct: number) => void
): Promise<CloudinaryUpload> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({ url: res.secure_url as string, publicId: res.public_id as string });
        } catch (e) {
          reject(e);
        }
      } else reject(new Error(`Cloudinary error ${xhr.status}: ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error("Network error uploading to Cloudinary"));
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", PRESET);
    form.append("folder", folder);
    xhr.send(form);
  });
}

export async function uploadImage(
  file: File,
  folder: UploadFolder,
  onProgress?: (pct: number) => void
): Promise<CloudinaryUpload> {
  if (!isImage(file)) throw new Error("Only image files are allowed");
  const compressed = await compressImage(file);
  if (compressed.size > MAX_SIZE_BYTES) throw new Error("Image is still larger than 5MB after compression");
  return uploadToCloudinary(compressed, folder, onProgress);
}

// Legacy helper used by data-adapters — resolves a possibly-partial CloudinaryImage to a URL,
// optionally requesting a scaled variant when it's a Cloudinary asset.
export function resolveImage(img: { url?: string; publicId?: string } | undefined | null, width?: number): string {
  if (!img?.url) return "";
  if (!img.url.includes("res.cloudinary.com")) return img.url;
  const t = width ? `f_auto,q_auto,w_${width}` : `f_auto,q_auto`;
  return img.url.replace("/upload/", `/upload/${t}/`);
}

// Build a responsive srcset for a Cloudinary URL. Non-Cloudinary URLs are returned as-is.
const DEFAULT_WIDTHS = [400, 640, 828, 1080, 1280, 1600, 1920, 2400];
export function cldSrcSet(url: string | undefined | null, widths: number[] = DEFAULT_WIDTHS): string {
  if (!url || !url.includes("res.cloudinary.com")) return "";
  return widths
    .map((w) => `${url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`)} ${w}w`)
    .join(", ");
}

// Return an optimized Cloudinary URL with f_auto,q_auto (and optional width). Safe for non-Cloudinary URLs.
export function cldUrl(url: string | undefined | null, width?: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  const t = width ? `f_auto,q_auto,w_${width}` : `f_auto,q_auto`;
  return url.replace("/upload/", `/upload/${t}/`);
}
