// Seeds Firestore from the static content bundled in the frontend.
// Callable from the admin dashboard.

import { PROPERTIES as STATIC_PROPERTIES } from "./properties";
import { POSTS as STATIC_POSTS } from "./blog";
import { FAQ_GROUPS } from "./faqs";
import { upsertProperty } from "./firestore/mutations";
import { upsertPost } from "./firestore/mutations";
import { upsertFaq } from "./firestore/mutations";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { PropertyDoc, BlogPostDoc, FaqDoc } from "./firestore/types";

function toType(t: string): PropertyDoc["type"] {
  const k = t.toLowerCase();
  if (k.includes("apartment") || k.includes("flat")) return "apartments";
  if (k.includes("gated")) return "gated_community";
  if (k.includes("premium")) return "premium_plots";
  return "plots";
}

function idFor(slug: string) {
  return slug.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

export type SeedProgress = (label: string, done: number, total: number) => void;

export async function seedProperties(onProgress?: SeedProgress) {
  const items = STATIC_PROPERTIES;
  let i = 0;
  for (const p of items) {
    const id = idFor(p.slug);
    const cover = { url: p.images[0], publicId: "" };
    const gallery = p.images.slice(1).map((u) => ({ url: u, publicId: "" }));
    const approvals: string[] = [];
    if (p.approvals?.kauda) approvals.push("KAUDA");
    if (p.approvals?.dtcp) approvals.push("DTCP");
    const data: Omit<PropertyDoc, "id" | "createdAt" | "updatedAt"> = {
      slug: p.slug,
      name: p.name,
      type: toType(p.type),
      location: p.location,
      shortDescription: p.short,
      fullDescription: (p.overview || []).join("\n\n"),
      highlights: p.highlights || [],
      amenities: p.amenities || [],
      approvals,
      reraId: p.approvals?.rera || "",
      coverImage: cover,
      galleryImages: gallery,
      status: "ongoing",
      isFeatured: i < 3,
      isPublished: true,
      displayOrder: i,
      locationAdvantages: p.locationAdvantages,
      mapQuery: p.mapQuery,
    };
    await upsertProperty(id, data);
    i++;
    onProgress?.("properties", i, items.length);
  }
}

export async function seedPosts(onProgress?: SeedProgress) {
  const items = STATIC_POSTS;
  let i = 0;
  for (const p of items) {
    const id = idFor(p.slug);
    const html = (p.content || [])
      .map((b) => {
        if (b.type === "h2") return `<h2>${b.text}</h2>`;
        if (b.type === "p") return `<p>${b.text}</p>`;
        if (b.type === "quote") return `<blockquote>${b.text}</blockquote>`;
        if (b.type === "ul" && b.items) return `<ul>${b.items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
        if (b.type === "img" && b.src) return `<figure><img src="${b.src}" alt="${b.caption || ""}"/>${b.caption ? `<figcaption>${b.caption}</figcaption>` : ""}</figure>`;
        if (b.type === "h3") return `<h3>${b.text}</h3>`;
        return "";
      })
      .join("\n");
    const data: Omit<BlogPostDoc, "id" | "createdAt" | "updatedAt"> = {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: html,
      coverImage: { url: p.image, publicId: "" },
      category: p.category,
      author: p.author,
      isPublished: true,
      readTime: p.readTime,
    };
    await upsertPost(id, data);
    i++;
    onProgress?.("posts", i, items.length);
  }
}

export async function seedFaqs(onProgress?: SeedProgress) {
  const flat: FaqDoc[] = [];
  let order = 0;
  for (const g of FAQ_GROUPS) {
    for (const it of g.items) {
      flat.push({
        id: idFor(`${g.id}-${order}`),
        question: it.q,
        answer: it.a,
        category: g.title,
        displayOrder: order,
        showOnHomepage: order < 6,
        isActive: true,
      });
      order++;
    }
  }
  let i = 0;
  for (const f of flat) {
    const { id, ...rest } = f;
    await upsertFaq(id, rest);
    i++;
    onProgress?.("faqs", i, flat.length);
  }
}

export async function seedAdmin(uid: string, email: string, name = "Admin") {
  await setDoc(
    doc(db, "admins", uid),
    { email, name, role: "admin", createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function seedAll(onProgress?: SeedProgress) {
  await seedProperties(onProgress);
  await seedPosts(onProgress);
  await seedFaqs(onProgress);
}
