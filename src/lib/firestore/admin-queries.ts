// Admin-side list-all queries (include unpublished / inactive).
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import type { BlogPostDoc, FaqDoc, GalleryImageDoc, PropertyDoc, TeamMemberDoc, TestimonialDoc } from "./types";

function map<T>(snap: Awaited<ReturnType<typeof getDocs>>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
}

export async function listAllProperties(): Promise<PropertyDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, "properties"), orderBy("displayOrder", "asc")));
    return map<PropertyDoc>(snap);
  } catch {
    const snap = await getDocs(collection(db, "properties"));
    return map<PropertyDoc>(snap).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
}
export async function listAllPosts(): Promise<BlogPostDoc[]> {
  const snap = await getDocs(collection(db, "blogPosts"));
  return map<BlogPostDoc>(snap).sort((a, b) => {
    const at = a.publishedAt?.toMillis?.() ?? 0;
    const bt = b.publishedAt?.toMillis?.() ?? 0;
    return bt - at;
  });
}
export async function listAllFaqs(): Promise<FaqDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, "faqs"), orderBy("displayOrder", "asc")));
    return map<FaqDoc>(snap);
  } catch {
    const snap = await getDocs(collection(db, "faqs"));
    return map<FaqDoc>(snap);
  }
}
export async function listAllGallery(): Promise<GalleryImageDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, "galleryImages"), orderBy("displayOrder", "asc")));
    return map<GalleryImageDoc>(snap);
  } catch {
    const snap = await getDocs(collection(db, "galleryImages"));
    return map<GalleryImageDoc>(snap);
  }
}
export async function listAllTestimonials(): Promise<TestimonialDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, "testimonials"), orderBy("displayOrder", "asc")));
    return map<TestimonialDoc>(snap);
  } catch {
    const snap = await getDocs(collection(db, "testimonials"));
    return map<TestimonialDoc>(snap).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
}
export async function listAllTeamMembers(): Promise<TeamMemberDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, "teamMembers"), orderBy("displayOrder", "asc")));
    return map<TeamMemberDoc>(snap);
  } catch {
    const snap = await getDocs(collection(db, "teamMembers"));
    return map<TeamMemberDoc>(snap).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
}
