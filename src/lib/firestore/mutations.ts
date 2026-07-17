import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  BlogPostDoc,
  EnquiryDoc,
  FaqDoc,
  GalleryImageDoc,
  PropertyDoc,
  TeamMemberDoc,
  TestimonialDoc,
  HeroConfigDoc,
} from "./types";

// ---------- Enquiries ----------
export async function createEnquiry(
  input: Omit<EnquiryDoc, "id" | "status" | "createdAt"> & { status?: EnquiryDoc["status"] }
) {
  const ref = await addDoc(collection(db, "enquiries"), {
    ...input,
    status: input.status ?? "new",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ---------- Generic collection helpers ----------
type Writable<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

async function createDoc<T>(col: string, data: Writable<T>) {
  const ref = await addDoc(collection(db, col), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}
async function upsertDoc<T>(col: string, id: string, data: Writable<T>) {
  await setDoc(
    doc(db, col, id),
    { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true }
  );
}
async function updateAny(col: string, id: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() });
}
async function removeDoc(col: string, id: string) {
  await deleteDoc(doc(db, col, id));
}

import { writeAuditLog } from "./audit";

// Properties
export const createProperty = async (d: Writable<PropertyDoc>) => {
  const id = await createDoc<PropertyDoc>("properties", d);
  await writeAuditLog({ entity: "property", entityId: id, action: "create", data: d as Record<string, unknown> });
  return id;
};
export const upsertProperty = async (id: string, d: Writable<PropertyDoc>) => {
  await upsertDoc<PropertyDoc>("properties", id, d);
  await writeAuditLog({ entity: "property", entityId: id, action: "update", data: d as Record<string, unknown> });
};
export const updateProperty = async (id: string, d: Partial<PropertyDoc>) => {
  await updateAny("properties", id, d);
  await writeAuditLog({ entity: "property", entityId: id, action: "update", data: d as Record<string, unknown> });
};
export const deleteProperty = async (id: string) => {
  const label = await (async () => {
    try {
      const { getDoc, doc } = await import("firebase/firestore");
      const s = await getDoc(doc(db, "properties", id));
      const data = s.exists() ? (s.data() as { name?: string; slug?: string }) : null;
      return data?.name || data?.slug || "";
    } catch { return ""; }
  })();
  await removeDoc("properties", id);
  await writeAuditLog({ entity: "property", entityId: id, action: "delete", label });
};

// Blog posts
export const createPost = async (d: Writable<BlogPostDoc>) => {
  const id = await createDoc<BlogPostDoc>("blogPosts", d);
  await writeAuditLog({ entity: "blogPost", entityId: id, action: "create", data: d as Record<string, unknown> });
  return id;
};
export const upsertPost = async (id: string, d: Writable<BlogPostDoc>) => {
  await upsertDoc<BlogPostDoc>("blogPosts", id, d);
  await writeAuditLog({ entity: "blogPost", entityId: id, action: "update", data: d as Record<string, unknown> });
};
export const updatePost = async (id: string, d: Partial<BlogPostDoc>) => {
  await updateAny("blogPosts", id, d);
  await writeAuditLog({ entity: "blogPost", entityId: id, action: "update", data: d as Record<string, unknown> });
};
export const deletePost = async (id: string) => {
  const label = await (async () => {
    try {
      const { getDoc, doc } = await import("firebase/firestore");
      const s = await getDoc(doc(db, "blogPosts", id));
      const data = s.exists() ? (s.data() as { title?: string; slug?: string }) : null;
      return data?.title || data?.slug || "";
    } catch { return ""; }
  })();
  await removeDoc("blogPosts", id);
  await writeAuditLog({ entity: "blogPost", entityId: id, action: "delete", label });
};

// FAQs
export const createFaq = (d: Writable<FaqDoc>) => createDoc<FaqDoc>("faqs", d);
export const upsertFaq = (id: string, d: Writable<FaqDoc>) => upsertDoc<FaqDoc>("faqs", id, d);
export const updateFaq = (id: string, d: Partial<FaqDoc>) => updateAny("faqs", id, d);
export const deleteFaq = (id: string) => removeDoc("faqs", id);

// Gallery
export const createGallery = async (d: Writable<GalleryImageDoc>) => {
  const id = await createDoc<GalleryImageDoc>("galleryImages", d);
  await writeAuditLog({ entity: "galleryImage", entityId: id, action: "create", data: d as Record<string, unknown> });
  return id;
};
export const upsertGallery = async (id: string, d: Writable<GalleryImageDoc>) => {
  await upsertDoc<GalleryImageDoc>("galleryImages", id, d);
  await writeAuditLog({ entity: "galleryImage", entityId: id, action: "update", data: d as Record<string, unknown> });
};
export const updateGallery = async (id: string, d: Partial<GalleryImageDoc>) => {
  await updateAny("galleryImages", id, d);
  await writeAuditLog({ entity: "galleryImage", entityId: id, action: "update", data: d as Record<string, unknown> });
};
export const deleteGallery = async (id: string) => {
  const label = await (async () => {
    try {
      const { getDoc, doc } = await import("firebase/firestore");
      const s = await getDoc(doc(db, "galleryImages", id));
      const data = s.exists() ? (s.data() as { title?: string; category?: string }) : null;
      return data?.title || data?.category || "";
    } catch { return ""; }
  })();
  await removeDoc("galleryImages", id);
  await writeAuditLog({ entity: "galleryImage", entityId: id, action: "delete", label });
};

// Testimonials
export const createTestimonial = (d: Writable<TestimonialDoc>) =>
  createDoc<TestimonialDoc>("testimonials", d);
export const upsertTestimonial = (id: string, d: Writable<TestimonialDoc>) =>
  upsertDoc<TestimonialDoc>("testimonials", id, d);
export const updateTestimonial = (id: string, d: Partial<TestimonialDoc>) =>
  updateAny("testimonials", id, d);
export const deleteTestimonial = (id: string) => removeDoc("testimonials", id);

// Team members
export const createTeamMember = (d: Writable<TeamMemberDoc>) =>
  createDoc<TeamMemberDoc>("teamMembers", d);
export const updateTeamMember = (id: string, d: Partial<TeamMemberDoc>) =>
  updateAny("teamMembers", id, d);
export const deleteTeamMember = (id: string) => removeDoc("teamMembers", id);

// Enquiries admin ops
export const updateEnquiry = (id: string, d: Partial<EnquiryDoc>) => updateAny("enquiries", id, d);
export const deleteEnquiry = (id: string) => removeDoc("enquiries", id);

// Settings
export const updateHeroConfig = async (d: Writable<HeroConfigDoc>) => {
  await upsertDoc<HeroConfigDoc>("settings", "hero", d);
  await writeAuditLog({ entity: "heroConfig", entityId: "hero", action: "update", data: d as Record<string, unknown> });
};
