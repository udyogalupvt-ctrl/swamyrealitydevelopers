import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import type { PropertyDoc, BlogPostDoc, GalleryImageDoc, TeamMemberDoc, TestimonialDoc, FaqDoc } from "./types";

function mapSnap<T>(snap: any): T[] {
  return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as object) }) as T);
}

/**
 * Subscribes to Firestore collections powering the public site and pushes
 * live updates into the React Query cache. Mounted once at the app root.
 * Any change made from the admin (or another device) reflects instantly on
 * /properties, /gallery, /blog and the home page without a refetch.
 */
export function useFirestoreRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    // Properties (published)
    try {
      const qProps = query(
        collection(db, "properties"),
        where("isPublished", "==", true),
        orderBy("displayOrder", "asc")
      );
      unsubs.push(
        onSnapshot(qProps, (snap) => {
          const list = mapSnap<PropertyDoc>(snap);
          qc.setQueryData(["properties"], list);
          qc.setQueryData(
            ["properties", "featured"],
            list.filter((p) => p.isFeatured).slice(0, 6)
          );
          // Warm per-slug caches so detail pages open instantly.
          for (const p of list) qc.setQueryData(["property", p.slug], p);
        }, () => {})
      );
    } catch {}

    // Blog posts (published)
    try {
      const qPosts = query(
        collection(db, "blogPosts"),
        where("isPublished", "==", true),
        orderBy("publishedAt", "desc")
      );
      unsubs.push(
        onSnapshot(qPosts, (snap) => {
          const list = mapSnap<BlogPostDoc>(snap);
          qc.setQueryData(["posts"], list);
          for (const p of list) qc.setQueryData(["post", p.slug], p);
        }, () => {})
      );
    } catch {}

    // Gallery (active)
    try {
      const qGal = query(
        collection(db, "galleryImages"),
        where("isActive", "==", true),
        orderBy("displayOrder", "asc")
      );
      unsubs.push(
        onSnapshot(qGal, (snap) => {
          qc.setQueryData(["gallery"], mapSnap<GalleryImageDoc>(snap));
        }, () => {})
      );
    } catch {}

    // Testimonials (active)
    try {
      const qTest = query(
        collection(db, "testimonials"),
        where("isActive", "==", true),
        orderBy("displayOrder", "asc")
      );
      unsubs.push(
        onSnapshot(qTest, (snap) => {
          qc.setQueryData(["testimonials"], mapSnap<TestimonialDoc>(snap));
        }, () => {})
      );
    } catch {}

    // FAQs (active)
    try {
      const qFaqs = query(
        collection(db, "faqs"),
        where("isActive", "==", true),
        orderBy("displayOrder", "asc")
      );
      unsubs.push(
        onSnapshot(qFaqs, (snap) => {
          const list = mapSnap<FaqDoc>(snap);
          qc.setQueryData(["faqs"], list);
          qc.setQueryData(["faqs", "home"], list.filter((f) => f.showOnHomepage));
        }, () => {})
      );
    } catch {}

    // Team members (active)
    try {
      const qTeam = query(
        collection(db, "teamMembers"),
        where("isActive", "==", true),
        orderBy("displayOrder", "asc"),
      );
      unsubs.push(
        onSnapshot(qTeam, (snap) => {
          qc.setQueryData(["teamMembers"], mapSnap<TeamMemberDoc>(snap));
        }, () => {}),
      );
    } catch {}

    return () => {
      for (const u of unsubs) {
        try { u(); } catch {}
      }
    };
  }, [qc]);
}
