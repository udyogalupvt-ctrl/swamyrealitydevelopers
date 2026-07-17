// Central SEO helpers — titles, meta, canonical, and JSON-LD builders.
// Used by every route to keep on-page SEO consistent.

export const SITE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_SITE_URL) ||
  "https://swamyrealitydevelopers.com";

export const SITE_NAME = "Swamy Reality Developers";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`;

export const CONTACT = {
  phone: "+919989778222",
  phoneDisplay: "+91 99897 78222",
  email: "sales@swamyrealitydevelopers.com",
  address: {
    street: "Jawahar St, near Nookalamma Temple",
    locality: "Rama Rao Peta",
    city: "Kakinada",
    region: "Andhra Pradesh",
    postalCode: "533004",
    country: "IN",
  },
  geo: { lat: 16.9891, lng: 82.2475 },
  social: {
    facebook: "https://www.facebook.com/swamyrealitydevelopers",
    instagram: "https://www.instagram.com/swamyrealitydevelopers",
    youtube: "https://www.youtube.com/@swamyrealitydevelopers",
    linkedin: "https://www.linkedin.com/company/swamy-reality-developers",
  },
};

export function abs(path: string) {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type MetaTag = Record<string, string>;

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}): { meta: MetaTag[]; links: MetaTag[] } {
  const canonical = abs(opts.path);
  const image = abs(opts.image || DEFAULT_OG_IMAGE);
  const type = opts.type || "website";
  const meta: MetaTag[] = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: canonical },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: image },
  ];
  if (opts.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  else meta.push({ name: "robots", content: "index, follow, max-image-preview:large" });
  return {
    meta,
    links: [{ rel: "canonical", href: canonical }],
  };
}

// -----------------------------
// JSON-LD builders
// -----------------------------

export function ldScript(json: object) {
  // TanStack head() accepts scripts with children strings.
  return {
    type: "application/ld+json",
    children: JSON.stringify(json),
  };
}

export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "RealEstateAgent"],
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "RERA & KAUDA approved real estate developer in Kakinada — premium plots, apartments and gated communities across Andhra Pradesh.",
  telephone: CONTACT.phone,
  email: CONTACT.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.address.street,
    addressLocality: CONTACT.address.locality,
    addressRegion: CONTACT.address.region,
    postalCode: CONTACT.address.postalCode,
    addressCountry: CONTACT.address.country,
  },
  areaServed: ["Kakinada", "East Godavari", "Andhra Pradesh"],
  sameAs: Object.values(CONTACT.social),
});

export const localBusinessLd = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}#localbusiness`,
  name: SITE_NAME,
  image: `${SITE_URL}/logo.png`,
  url: SITE_URL,
  telephone: CONTACT.phone,
  email: CONTACT.email,
  priceRange: "₹₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.address.street,
    addressLocality: CONTACT.address.locality,
    addressRegion: CONTACT.address.region,
    postalCode: CONTACT.address.postalCode,
    addressCountry: CONTACT.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: CONTACT.geo.lat,
    longitude: CONTACT.geo.lng,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "19:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "10:00",
      closes: "17:00",
    },
  ],
  sameAs: Object.values(CONTACT.social),
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: abs(it.path),
  })),
});

export const articleLd = (p: {
  title: string;
  excerpt: string;
  image?: string;
  slug: string;
  author?: string;
  date?: string;
  updated?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: p.title,
  description: p.excerpt,
  image: p.image ? abs(p.image) : DEFAULT_OG_IMAGE,
  mainEntityOfPage: abs(`/blog/${p.slug}`),
  datePublished: p.date || new Date().toISOString(),
  dateModified: p.updated || p.date || new Date().toISOString(),
  author: { "@type": "Organization", name: p.author || SITE_NAME },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  },
});

export const listingLd = (p: {
  name: string;
  short: string;
  type: string;
  location: string;
  slug: string;
  images: string[];
  price?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  additionalType: "https://schema.org/RealEstateListing",
  name: p.name,
  description: p.short,
  image: (p.images || []).map(abs),
  url: abs(`/properties/${p.slug}`),
  category: p.type,
  areaServed: p.location,
  brand: { "@type": "Organization", name: SITE_NAME },
  ...(p.price
    ? {
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: p.price,
          availability: "https://schema.org/InStock",
          url: abs(`/properties/${p.slug}`),
        },
      }
    : {}),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
});

export const aggregateRatingLd = (opts: {
  rating: number;
  count: number;
  reviews?: { author: string; rating: number; text: string }[];
}) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: opts.rating.toFixed(1),
    reviewCount: opts.count,
    bestRating: 5,
    worstRating: 1,
  },
  ...(opts.reviews
    ? {
        review: opts.reviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
          },
          reviewBody: r.text,
        })),
      }
    : {}),
});
