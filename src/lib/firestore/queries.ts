import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  BlogPostDoc,
  FaqDoc,
  GalleryImageDoc,
  PropertyDoc,
  TeamMemberDoc,
  TestimonialDoc,
  HeroConfigDoc,
} from "./types";

function mapDoc<T>(d: { id: string; data: () => Record<string, unknown> }): T {
  return { id: d.id, ...(d.data() as object) } as T;
}

// ---------- Properties ----------
export async function listPublishedProperties(): Promise<PropertyDoc[]> {
  const q = query(
    collection(db, "properties"),
    where("isPublished", "==", true),
    orderBy("displayOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<PropertyDoc>(d));
}

export async function listFeaturedProperties(max = 6): Promise<PropertyDoc[]> {
  // Firestore composite: isPublished==true & isFeatured==true, ordered by displayOrder.
  // Falls back to client-side filter if the composite index is missing.
  try {
    const q = query(
      collection(db, "properties"),
      where("isPublished", "==", true),
      where("isFeatured", "==", true),
      orderBy("displayOrder", "asc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapDoc<PropertyDoc>(d));
  } catch {
    const all = await listPublishedProperties();
    return all.filter((p) => p.isFeatured).slice(0, max);
  }
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDoc | null> {
  const q = query(collection(db, "properties"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? mapDoc<PropertyDoc>(first) : null;
}

// ---------- Blog ----------
export async function listPublishedPosts(): Promise<BlogPostDoc[]> {
  const q = query(
    collection(db, "blogPosts"),
    where("isPublished", "==", true),
    orderBy("publishedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<BlogPostDoc>(d));
}

export async function getPostBySlug(slug: string): Promise<BlogPostDoc | null> {
  const q = query(collection(db, "blogPosts"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? mapDoc<BlogPostDoc>(first) : null;
}

// ---------- FAQs ----------
export async function listActiveFaqs(): Promise<FaqDoc[]> {
  const q = query(
    collection(db, "faqs"),
    where("isActive", "==", true),
    orderBy("displayOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<FaqDoc>(d));
}

export async function listHomepageFaqs(): Promise<FaqDoc[]> {
  const all = await listActiveFaqs();
  return all.filter((f) => f.showOnHomepage);
}

// ---------- Gallery ----------
export async function listGalleryImages(): Promise<GalleryImageDoc[]> {
  const q = query(
    collection(db, "galleryImages"),
    where("isActive", "==", true),
    orderBy("displayOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<GalleryImageDoc>(d));
}

// ---------- Testimonials ----------
export async function listActiveTestimonials(): Promise<TestimonialDoc[]> {
  try {
    const q = query(
      collection(db, "testimonials"),
      where("isActive", "==", true),
      orderBy("displayOrder", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapDoc<TestimonialDoc>(d));
  } catch {
    const snap = await getDocs(collection(db, "testimonials"));
    return snap.docs
      .map((d) => mapDoc<TestimonialDoc>(d))
      .filter((t) => t.isActive !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
}


// ---------- Team members ----------
export async function listActiveTeamMembers(): Promise<TeamMemberDoc[]> {
  try {
    const q = query(
      collection(db, "teamMembers"),
      where("isActive", "==", true),
      orderBy("displayOrder", "asc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapDoc<TeamMemberDoc>(d));
  } catch {
    const snap = await getDocs(collection(db, "teamMembers"));
    return snap.docs
      .map((d) => mapDoc<TeamMemberDoc>(d))
      .filter((t) => t.isActive !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
}

// ---------- Admins ----------
export async function isAdminUid(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists();
}

// ---------- Settings ----------
export async function getHeroConfig(): Promise<HeroConfigDoc | null> {
  const snap = await getDoc(doc(db, "settings", "hero"));
  return snap.exists() ? mapDoc<HeroConfigDoc>(snap) : null;
}
