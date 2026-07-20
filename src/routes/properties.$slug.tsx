import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProperty, type Property } from "../lib/properties";
import { usePropertyBySlug, usePropertiesList } from "../lib/data-adapters";
import { SiteHeader, SiteFooter, ScrollProgress, useDarkMode, BackButton } from "../components/SiteChrome";
import { FloatingActions } from "../components/FloatingActions";
import { Reveal, useLenis } from "../components/motion";
import { InnerPageHero } from "../components/InnerPageHero";
import { PropertyCard } from "./properties.index";
import { pageMeta, ldScript, breadcrumbLd, listingLd } from "../lib/seo";

export const Route = createFileRoute("/properties/$slug")({
  loader: ({ params }) => {
    const property = getProperty(params.slug);
    return { property: property ?? null };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.property;
    const slug = params?.slug || "";
    if (!p) {
      const seo = pageMeta({
        title: "Property Not Found · Swamy Reality Developers",
        description: "This property is unavailable. Browse our RERA & KAUDA approved projects in Kakinada.",
        path: `/properties/${slug}`,
        noindex: true,
      });
      return seo;
    }
    const seo = pageMeta({
      title: `${p.name} — ${p.type} in ${p.location}, Kakinada | Swamy Reality`,
      description: `${p.short} RERA & KAUDA approved ${p.type.toLowerCase()} in ${p.location}, Kakinada by Swamy Reality Developers.`.slice(0, 155),
      path: `/properties/${p.slug}`,
      image: p.images?.[0],
    });
    return {
      ...seo,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: p.name, path: `/properties/${p.slug}` },
          ]),
        ),
        ldScript(
          listingLd({
            name: p.name,
            short: p.short,
            type: p.type,
            location: `${p.location}, Kakinada`,
            slug: p.slug,
            images: p.images || [],
          }),
        ),
      ],
    };
  },
  component: PropertyDetail,
  errorComponent: ({ error, reset }) => {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="font-display text-3xl text-ink">Something went wrong</h1>
        <p className="text-body">{error.message}</p>
        <button onClick={reset} className="rounded-full bg-[#1E3A5F] px-6 py-2.5 text-[13px] font-semibold text-white">Try again</button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-display text-3xl text-ink">Property not found</h1>
      <p className="text-body">The property you're looking for doesn't exist or has been removed.</p>
      <Link to="/properties" className="rounded-full bg-[#1E3A5F] px-6 py-2.5 text-[13px] font-semibold text-white">Browse properties</Link>
    </div>
  ),
});

function PropertyDetail() {
  const { slug } = Route.useParams();
  const { property: staticProperty } = Route.useLoaderData();
  const { data: livePost, loading } = usePropertyBySlug(slug);
  const { data: properties } = usePropertiesList();
  const p: Property | undefined = livePost ?? staticProperty ?? undefined;
  const { dark, toggle } = useDarkMode();
  useLenis();

  if (!p && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-[13px] text-body">
        Loading property details…
      </div>
    );
  }

  if (!p) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="font-display text-3xl text-ink">Property not found</h1>
        <Link to="/properties" className="rounded-full bg-[#1E3A5F] px-6 py-2.5 text-[13px] font-semibold text-white">Browse properties</Link>
      </div>
    );
  }

  const similar = properties.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <SiteHeader dark={dark} toggle={toggle} />

      <InnerPageHero
        image={p.images[0]}
        eyebrow={p.type}
        title={p.name}
        subtitle={p.location}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Properties", to: "/properties" },
          { label: p.name },
        ]}
      />

      {/* Back nav */}
      <div className="mx-auto max-w-[1280px] px-6 pt-6 lg:px-10 lg:pt-8">
        <BackButton to="/properties" label="Back to Properties" />
      </div>


      {/* Gallery */}
      <GallerySection
        images={p.images}
        imageAlts={p.imageAlts}
        youtubeUrls={p.youtubeUrls}
        name={p.name}
      />

      {/* Two-column content */}
      <section className="mx-auto max-w-[1280px] px-6 py-14 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
          {/* LEFT */}
          <div>
            <Reveal>
              <span className="inline-block rounded-full bg-[#1E3A5F]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy dark:bg-white/10 dark:text-white">
                {p.type}
              </span>
              <h1 className="mt-4 font-display text-[40px] leading-[1.05] text-ink lg:text-[60px] dark:text-white">{p.name}</h1>
              <div className="mt-4 flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] text-body">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {p.location}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 px-3 py-1.5 dark:border-white/20 dark:bg-white/5">
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-navy dark:text-white/70">RERA</span>
                  <span className="font-mono text-[11.5px] text-ink dark:text-white">{p.approvals.rera}</span>
                </div>
                {p.approvals.kauda && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E3A5F] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    KAUDA Approved
                  </span>
                )}
                {p.approvals.dtcp && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1E3A5F] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy dark:border-white/40 dark:text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                    DTCP Approved
                  </span>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 space-y-5 text-[15.5px] leading-[1.8] text-body">
                {p.overview.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-14">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-navy">Key Highlights</div>
                <h2 className="mt-3 font-display text-[28px] text-ink lg:text-[36px] dark:text-white">What makes this project special</h2>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F] text-white">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span className="text-[15px] leading-[1.6] text-ink dark:text-white/85">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-14">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-navy">Amenities</div>
                <h2 className="mt-2 font-display text-[22px] text-ink lg:text-[26px] dark:text-white">Built for everyday comfort</h2>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {p.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2.5 rounded-lg border border-black/10 bg-white px-3 py-2.5 transition-colors hover:border-[#1E3A5F] dark:border-white/15 dark:bg-[#131a25]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F]/10 text-navy dark:bg-white/10 dark:text-white">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span className="text-[12.5px] font-medium leading-tight text-ink dark:text-white/90">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>


            <Reveal delay={0.15}>
              <div className="mt-14">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-navy">Location Advantages</div>
                <h2 className="mt-3 font-display text-[28px] text-ink lg:text-[36px] dark:text-white">Everything within easy reach</h2>
                <ul className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/15 dark:bg-[#131a25]">
                  {p.locationAdvantages.map((la) => (
                    <li key={la.place} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-navy dark:text-white"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span className="text-[14.5px] text-ink dark:text-white/90">{la.place}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-navy dark:text-white">{la.distance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* RIGHT: sticky enquiry */}
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <EnquiryCard propertyName={p.name} propertySlug={p.slug} />
          </aside>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-[1280px] px-6 pb-16 lg:px-10 lg:pb-24">
        <Reveal>
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-navy">Location</div>
          <h2 className="mt-3 font-display text-[28px] text-ink lg:text-[36px] dark:text-white">Find us on the map</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 dark:border-white/15">
            <iframe
              title={`Map — ${p.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(p.mapQuery)}&output=embed`}
              width="100%"
              height="420"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </section>

      {/* Similar */}
      <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-navy">Explore More</div>
            <h2 className="mt-3 font-display text-[28px] text-ink lg:text-[42px] dark:text-white">Similar Projects</h2>
          </div>
          <Link to="/properties" className="link-underline text-[13px] font-medium text-ink dark:text-white">
            View All <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {similar.map((s) => (
            <PropertyCard key={s.slug} property={s} />
          ))}
        </div>
      </section>

      <SiteFooter />
      <FloatingActions />
    </div>
  );
}

// ------------------------------------------------------------------
// YouTube helpers
// ------------------------------------------------------------------
function extractYtId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.trim().match(p);
    if (m) return m[1];
  }
  return null;
}

type GalleryItem = { type: "image"; src: string; alt: string } | { type: "video"; youtubeId: string; url: string };

// ------------------------------------------------------------------
// GallerySection — images + YouTube videos
// ------------------------------------------------------------------
function GallerySection({
  images, imageAlts, youtubeUrls, name,
}: {
  images: string[]; imageAlts?: string[]; youtubeUrls?: string[]; name: string;
}) {
  const items: GalleryItem[] = [
    ...images.map((src, i): GalleryItem => ({
      type: "image",
      src,
      alt: imageAlts?.[i] || `${name} — image ${i + 1}`,
    })),
    ...(youtubeUrls || [])
      .map((url): GalleryItem | null => {
        const id = extractYtId(url);
        return id ? { type: "video", youtubeId: id, url } : null;
      })
      .filter((x): x is GalleryItem => x !== null),
  ];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const current = items[active];

  return (
    <>
      <section className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid gap-3 lg:grid-cols-[1fr_120px]">
          {/* Main viewer */}
          <button
            onClick={() => setLightbox(true)}
            className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black"
          >
            <AnimatePresence mode="wait">
              {current?.type === "image" ? (
                <motion.img
                  key={`img-${active}`}
                  src={current.src}
                  alt={current.alt}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : current?.type === "video" ? (
                <motion.div
                  key={`vid-${active}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <img
                    src={`https://img.youtube.com/vi/${current.youtubeId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur">
              {current?.type === "video" ? "Click to play" : "Click to expand"}
            </div>
          </button>

          {/* Thumbnails strip */}
          <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl transition-all lg:w-full ${
                  active === i ? "ring-2 ring-[#1E3A5F] ring-offset-2 dark:ring-offset-[#0f1520]" : "opacity-70 hover:opacity-100"
                }`}
              >
                {item.type === "image" ? (
                  <img src={item.src} alt={item.alt} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <MediaLightbox
            items={items}
            index={active}
            onIndex={setActive}
            onClose={() => setLightbox(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ------------------------------------------------------------------
// Lightbox — supports both images and YouTube embeds
// ------------------------------------------------------------------
function MediaLightbox({
  items, index, onIndex, onClose,
}: {
  items: GalleryItem[]; index: number; onIndex: (i: number) => void; onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, items.length, onIndex, onClose]);

  const [zoom, setZoom] = useState(1);
  const current = items[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex flex-col bg-black/95 backdrop-blur"
    >
      <div className="flex items-center justify-between px-6 py-4 text-white/80">
        <div className="text-[12px] font-medium uppercase tracking-[0.24em]">
          {index + 1} / {items.length}
          {current?.type === "video" && <span className="ml-2 text-red-400">● Video</span>}
        </div>
        <div className="flex items-center gap-2">
          {current?.type === "image" && (
            <>
              <button onClick={() => setZoom((z) => Math.max(1, z - 0.25))} aria-label="Zoom out" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 hover:bg-white/10">−</button>
              <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} aria-label="Zoom in" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 hover:bg-white/10">+</button>
            </>
          )}
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 hover:bg-white/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <button
          onClick={() => onIndex((index - 1 + items.length) % items.length)}
          className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Previous"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>
        </button>
        <AnimatePresence mode="wait">
          {current?.type === "image" ? (
            <motion.img
              key={`lb-img-${index}`}
              src={current.src}
              alt={current.alt}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: zoom }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-h-[85vh] max-w-[92vw] object-contain"
              style={{ cursor: zoom > 1 ? "zoom-out" : "zoom-in" }}
              onClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
            />
          ) : current?.type === "video" ? (
            <motion.div
              key={`lb-vid-${index}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="aspect-video w-full max-w-4xl"
            >
              <iframe
                src={`https://www.youtube.com/embed/${current.youtubeId}?autoplay=1&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full rounded-xl"
                title="YouTube video"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <button
          onClick={() => onIndex((index + 1) % items.length)}
          className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Next"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </div>
    </motion.div>
  );
}

function EnquiryCard({ propertyName, propertySlug }: { propertyName: string; propertySlug: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", mobile: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Please enter your name";
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g, "").slice(-10))) err.mobile = "Enter a valid mobile";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Invalid email";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const { createEnquiry } = await import("@/lib/firestore/mutations");
      await createEnquiry({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        message: form.message.trim() || `Site visit request for ${propertyName}.`,
        sourcePage: `property/${propertySlug}`,
        propertyId: propertySlug,
      });
      setSent(true);
    } catch (ex) {
      setSubmitError((ex as Error)?.message || "Please try calling us instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.2)] dark:border-white/15 dark:bg-[#131a25] lg:p-8">
      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-navy">Enquire Now</div>
      <h3 className="mt-2 font-display text-2xl text-ink dark:text-white">Interested in this project?</h3>
      <p className="mt-2 text-[13.5px] leading-[1.6] text-body">
        Share your details and our team will call you back within one working day about <span className="font-medium text-ink dark:text-white">{propertyName}</span>.
      </p>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl bg-[#1E3A5F]/10 p-5 text-center dark:bg-white/10"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A5F] text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div className="mt-3 font-display text-lg text-ink dark:text-white">Thanks — we'll be in touch.</div>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <FloatField label="Full Name" value={form.name} error={errors.name} onChange={(v) => setForm({ ...form, name: v })} />
          <FloatField label="Mobile Number" value={form.mobile} error={errors.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
          <FloatField label="Email (optional)" value={form.email} error={errors.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <FloatField label="Message" value={form.message} error={errors.message} onChange={(v) => setForm({ ...form, message: v })} textarea />
          {submitError && (
            <div className="rounded-md border border-red-300/70 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {submitError}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1E3A5F] py-3.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Sending…" : "Book Free Site Visit"}
          </button>
        </form>
      )}

      <div className="mt-4 grid gap-2">
        <a
          href="tel:+919989778222"
          className="flex items-center justify-center gap-2 rounded-full border border-black/10 py-3 text-[13px] font-medium text-ink transition-colors hover:border-[#1E3A5F] hover:text-navy dark:border-white/15 dark:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>
          Call +91 9989778222
        </a>
        <a
          href={`https://wa.me/919989778222?text=${encodeURIComponent(
            `Hi Swamy Reality Developers, I'm interested in ${propertyName}. Please share more details, pricing and site-visit availability.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.9 11.9 0 0 0 3 20l-1 4 4.1-1.1A12 12 0 1 0 20.5 3.5z"/></svg>
          WhatsApp Enquiry
        </a>
      </div>
    </div>
  );
}

function FloatField({
  label, value, onChange, type = "text", textarea, error,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const commonCls = `peer w-full rounded-lg border bg-transparent px-3.5 pt-5 pb-2 text-[14px] text-ink outline-none transition-colors dark:text-white ${
    error ? "border-red-400" : "border-black/15 focus:border-[#1E3A5F] dark:border-white/20 dark:focus:border-white/60"
  }`;
  return (
    <div className="relative">
      {textarea ? (
        <textarea
          value={value}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={commonCls + " resize-none"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={commonCls}
        />
      )}
      <label
        className={`pointer-events-none absolute left-3.5 origin-left transition-all ${
          active
            ? "top-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-navy dark:text-white/70"
            : "top-4 text-[13.5px] text-body"
        }`}
      >
        {label}
      </label>
      {error && (
        <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-[11px] text-red-500">
          {error}
        </motion.div>
      )}
    </div>
  );
}

