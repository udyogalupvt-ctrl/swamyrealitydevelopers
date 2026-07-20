// Adapts Firestore document shapes to the existing static content shapes used by pages.
// Includes fallback to hardcoded content when Firestore is empty (before seeding),
// so the site renders correctly at every stage.

import { PROPERTIES as STATIC_PROPERTIES, type Property, type PropertyType } from "./properties";
import { POSTS as STATIC_POSTS, type Post } from "./blog";
import { FAQ_GROUPS } from "./faqs";
import {
  useFaqs,
  useFeaturedProperties,
  useGallery,
  useHomepageFaqs,
  usePost,
  usePosts,
  useProperties,
  useProperty,
} from "./queries";
import type {
  BlogPostDoc,
  FaqDoc,
  GalleryImageDoc,
  PropertyDoc,
} from "./firestore/types";
import { PROPERTY_TYPE_LABEL } from "./firestore/types";
import { resolveImage } from "./cloudinary";

// ------------- Property adapters -------------
export function propertyFromDoc(doc: PropertyDoc): Property {
  const paragraphs = (doc.fullDescription || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const overview = paragraphs.length > 0 ? paragraphs : [doc.shortDescription || ""];
  const cover = resolveImage(doc.coverImage, 2000);
  const galleryUrls = (doc.galleryImages || []).map((g) => resolveImage(g, 1600));
  const rawImages = [
    { url: cover, alt: doc.coverImage?.alt },
    ...(doc.galleryImages || []).map((g, i) => ({ url: galleryUrls[i], alt: g.alt })),
  ].filter((e) => !!e.url);
  const images = rawImages.map((e) => e.url);
  const imageAlts = rawImages.map((e) => e.alt || doc.name);
  const approvals = doc.approvals || [];
  return {
    slug: doc.slug,
    name: doc.name,
    type: PROPERTY_TYPE_LABEL[doc.type] as PropertyType,
    location: doc.location,
    short: doc.shortDescription,
    overview,
    images: images.length ? images : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"],
    cardImage: doc.cardImage ? resolveImage(doc.cardImage, 800) : (images[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"),
    imageAlts: imageAlts.length ? imageAlts : [doc.name],
    amenities: doc.amenities || [],
    highlights: doc.highlights || [],
    approvals: {
      rera: doc.reraId || "",
      kauda: approvals.map((a) => a.toUpperCase()).includes("KAUDA"),
      dtcp: approvals.map((a) => a.toUpperCase()).includes("DTCP"),
    },
    locationAdvantages: doc.locationAdvantages || [],
    mapQuery: doc.mapQuery || doc.location,
    youtubeUrls: doc.youtubeUrls || [],
  };
}

export function usePropertiesList(): { data: Property[]; loading: boolean; error: boolean } {
  const q = useProperties();
  const list = q.data && q.data.length > 0 ? q.data.map(propertyFromDoc) : STATIC_PROPERTIES;
  return { data: list, loading: q.isLoading, error: !!q.error };
}

export function useFeaturedList(): { data: Property[]; loading: boolean } {
  const q = useFeaturedProperties();
  const list =
    q.data && q.data.length > 0
      ? q.data.map(propertyFromDoc)
      : STATIC_PROPERTIES.slice(0, 3);
  return { data: list, loading: q.isLoading };
}

export function usePropertyBySlug(slug: string | undefined): {
  data: Property | undefined;
  loading: boolean;
} {
  const q = useProperty(slug);
  if (q.data) return { data: propertyFromDoc(q.data), loading: false };
  if (q.isLoading) return { data: undefined, loading: true };
  const fallback = STATIC_PROPERTIES.find((p) => p.slug === slug);
  return { data: fallback, loading: false };
}

// ------------- Blog adapters -------------
export function postFromDoc(doc: BlogPostDoc): Post {
  const published = doc.publishedAt?.toDate?.() ?? doc.createdAt?.toDate?.();
  const date = published
    ? published.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "";
  const image = resolveImage(doc.coverImage, 1600);
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    category: (doc.category as Post["category"]) || "Buying Guide",
    date,
    readTime: doc.readTime || "6 min read",
    image: image || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
    imageAlt: doc.coverImage?.alt || doc.title,
    author: doc.author || "SRD Editorial",
    // HTML content is rendered separately on the detail page; content array kept for legacy pages.
    content: [{ type: "p", text: doc.excerpt }],
  };
}

export function usePostsList(): { data: Post[]; loading: boolean; raw: BlogPostDoc[] } {
  const q = usePosts();
  const list = q.data && q.data.length > 0 ? q.data.map(postFromDoc) : STATIC_POSTS;
  return { data: list, loading: q.isLoading, raw: q.data || [] };
}

export function usePostBySlug(slug: string | undefined): {
  data: Post | undefined;
  html: string | undefined;
  loading: boolean;
  raw: BlogPostDoc | undefined;
} {
  const q = usePost(slug);
  if (q.data) return { data: postFromDoc(q.data), html: q.data.content, loading: false, raw: q.data };
  if (q.isLoading) return { data: undefined, html: undefined, loading: true, raw: undefined };
  const fallback = STATIC_POSTS.find((p) => p.slug === slug);
  return { data: fallback, html: undefined, loading: false, raw: undefined };
}

// ------------- FAQ adapters -------------
type FaqGroup = { id: string; title: string; items: { q: string; a: string }[] };

function toGroup(id: string): FaqGroup {
  return {
    id,
    title: id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    items: [],
  };
}

export function faqsToGroups(docs: FaqDoc[]): FaqGroup[] {
  const map = new Map<string, FaqGroup>();
  const sorted = [...docs].sort((a, b) => a.displayOrder - b.displayOrder);
  for (const f of sorted) {
    const key = (f.category || "general").toLowerCase().replace(/\s+/g, "-");
    if (!map.has(key)) map.set(key, toGroup(key));
    map.get(key)!.items.push({ q: f.question, a: f.answer });
  }
  return Array.from(map.values());
}

export function useFaqGroups(): { data: FaqGroup[]; loading: boolean } {
  const q = useFaqs();
  const list =
    q.data && q.data.length > 0
      ? faqsToGroups(q.data)
      : (FAQ_GROUPS as unknown as FaqGroup[]);
  return { data: list, loading: q.isLoading };
}

export function useHomepageFaqList(): { data: { q: string; a: string }[]; loading: boolean } {
  const q = useHomepageFaqs();
  if (q.data && q.data.length > 0) {
    const items = [...q.data]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((f) => ({ q: f.question, a: f.answer }));
    return { data: items, loading: false };
  }
  // Fallback: first 6 items across all groups.
  const flat: { q: string; a: string }[] = [];
  for (const g of FAQ_GROUPS) for (const it of g.items) flat.push({ q: it.q, a: it.a });
  return { data: flat.slice(0, 6), loading: q.isLoading };
}

// ------------- Gallery adapters -------------
export type GalleryItem = { id: string; url: string; title: string; category: string; alt: string };

export function galleryFromDoc(doc: GalleryImageDoc): GalleryItem {
  return {
    id: doc.id,
    url: resolveImage(doc.image, 1600),
    title: doc.title,
    category: doc.category,
    alt: doc.image?.alt || doc.title,
  };
}

export function useGalleryList(): { data: GalleryItem[]; loading: boolean } {
  const q = useGallery();
  const list = q.data && q.data.length > 0 ? q.data.map(galleryFromDoc) : [];
  return { data: list, loading: q.isLoading };
}
