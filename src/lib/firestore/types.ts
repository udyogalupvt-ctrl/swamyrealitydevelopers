import type { Timestamp } from "firebase/firestore";

export type CloudinaryImage = { url: string; publicId: string; alt?: string };

export type PropertyDoc = {
  id: string;
  slug: string;
  name: string;
  type: "apartments" | "plots" | "gated_community" | "premium_plots";
  location: string;
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  amenities: string[];
  approvals: string[];
  reraId: string;
  coverImage: CloudinaryImage;
  cardImage?: CloudinaryImage;
  youtubeUrls?: string[];
  galleryImages: CloudinaryImage[];
  status: "ongoing" | "completed" | "upcoming";
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  /** Optional legacy fields used by the existing detail page. */
  locationAdvantages?: { place: string; distance: string }[];
  mapQuery?: string;
};

export type BlogPostDoc = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML
  coverImage: CloudinaryImage;
  category: string;
  author: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  /** legacy fallback for pre-migration rich content */
  richContent?: unknown;
  readTime?: string;
};

export type FaqDoc = {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  showOnHomepage: boolean;
  isActive: boolean;
  createdAt?: Timestamp;
};

export type GalleryImageDoc = {
  id: string;
  image: CloudinaryImage;
  title: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Timestamp;
};

export type EnquiryDoc = {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  sourcePage: string;
  propertyId: string | null;
  status: "new" | "contacted" | "closed";
  createdAt?: Timestamp;
};

export type TestimonialDoc = {
  id: string;
  name: string;
  role?: string;
  quote: string;
  rating: number;
  avatar?: CloudinaryImage;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type TeamMemberDoc = {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: CloudinaryImage;
  isFounder?: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type AdminDoc = {
  email: string;
  name: string;
  role: "admin";
  createdAt?: Timestamp;
};

export type HeroSlide = {
  n: string;
  name: string;
  type: string;
  location: string;
  image: CloudinaryImage;
  mobileImage?: CloudinaryImage;
};

export type HeroConfigDoc = {
  id?: string;
  title1: string; // e.g. "Building Homes."
  title2: string; // e.g. "Creating Futures."
  subtitle: string; // e.g. "RERA & KAUDA approved plots, apartments and gated communities in Kakinada."
  slides: HeroSlide[];
  updatedAt?: Timestamp;
};

export const PROPERTY_TYPE_LABEL: Record<PropertyDoc["type"], string> = {
  apartments: "Apartments",
  plots: "Residential Plots",
  gated_community: "Gated Community",
  premium_plots: "Premium Plots",
};
