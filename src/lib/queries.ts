import { useQuery } from "@tanstack/react-query";
import {
  getPostBySlug,
  getPropertyBySlug,
  listActiveFaqs,
  listActiveTeamMembers,
  listActiveTestimonials,
  listFeaturedProperties,
  listGalleryImages,
  listHomepageFaqs,
  listPublishedPosts,
  listPublishedProperties,
} from "./firestore/queries";

const STALE = 5 * 60_000;

export const useProperties = () =>
  useQuery({ queryKey: ["properties"], queryFn: listPublishedProperties, staleTime: STALE });

export const useFeaturedProperties = () =>
  useQuery({
    queryKey: ["properties", "featured"],
    queryFn: () => listFeaturedProperties(6),
    staleTime: STALE,
  });

export const useProperty = (slug: string | undefined) =>
  useQuery({
    queryKey: ["property", slug],
    queryFn: () => getPropertyBySlug(slug!),
    enabled: !!slug,
    staleTime: STALE,
  });

export const usePosts = () =>
  useQuery({ queryKey: ["posts"], queryFn: listPublishedPosts, staleTime: STALE });

export const usePost = (slug: string | undefined) =>
  useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: !!slug,
    staleTime: STALE,
  });

export const useFaqs = () =>
  useQuery({ queryKey: ["faqs"], queryFn: listActiveFaqs, staleTime: STALE });

export const useHomepageFaqs = () =>
  useQuery({ queryKey: ["faqs", "home"], queryFn: listHomepageFaqs, staleTime: STALE });

export const useGallery = () =>
  useQuery({ queryKey: ["gallery"], queryFn: listGalleryImages, staleTime: STALE });

export const useTestimonials = () =>
  useQuery({ queryKey: ["testimonials"], queryFn: listActiveTestimonials, staleTime: STALE });

export const useTeamMembers = () =>
  useQuery({ queryKey: ["teamMembers"], queryFn: listActiveTeamMembers, staleTime: STALE });
