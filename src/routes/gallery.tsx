import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Preloader, ScrollProgress, SiteFooter, SiteHeader, useDarkMode } from "@/components/SiteChrome";
import { WordReveal, useLenis } from "@/components/motion";
import { InnerPageHero } from "@/components/InnerPageHero";
import { pageMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { useGalleryList } from "@/lib/data-adapters";

export const Route = createFileRoute("/gallery")({
  head: () => {
    const seo = pageMeta({
      title: "Project Gallery — Apartments & Plots in Kakinada | Swamy Reality",
      description:
        "See our completed apartments, gated communities and plots in Kakinada — walkthroughs, site visits and events by Swamy Reality Developers.",
      path: "/gallery",
    });
    return {
      ...seo,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Gallery", path: "/gallery" },
          ]),
        ),
      ],
    };
  },
  component: GalleryPage,
});

type Category = string;

type Item = { id: string; cat: string; src: string; title: string; h: number; alt?: string };

const IMAGES: Item[] = [
  { id: "a1", cat: "Apartments", title: "Sri Sri Residency", h: 520, src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" },
  { id: "gc1", cat: "Gated Communities", title: "Mahatma Enclave", h: 700, src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" },
  { id: "p1", cat: "Plots", title: "Riverside Plots", h: 460, src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" },
  { id: "sv1", cat: "Site Visits", title: "Family Walkthrough", h: 620, src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80" },
  { id: "a2", cat: "Apartments", title: "Skyline Heights", h: 560, src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80" },
  { id: "ev1", cat: "Events", title: "Handover Ceremony", h: 480, src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80" },
  { id: "gc2", cat: "Gated Communities", title: "Palm Grove Villas", h: 660, src: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80" },
  { id: "p2", cat: "Plots", title: "Sashikanth Nagar", h: 500, src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80" },
  { id: "a3", cat: "Apartments", title: "Green Meadows", h: 640, src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" },
  { id: "sv2", cat: "Site Visits", title: "Foundation Day", h: 540, src: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80" },
  { id: "ev2", cat: "Events", title: "Community Diwali", h: 600, src: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80" },
  { id: "gc3", cat: "Gated Communities", title: "Aster Heights", h: 720, src: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80" },
  { id: "p3", cat: "Plots", title: "Kakinada Central", h: 460, src: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80" },
  { id: "a4", cat: "Apartments", title: "Sunset Towers", h: 580, src: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80" },
  { id: "sv3", cat: "Site Visits", title: "Client Site Tour", h: 620, src: "https://images.unsplash.com/photo-1590725175785-de25cae0b0b5?auto=format&fit=crop&w=1200&q=80" },
  { id: "ev3", cat: "Events", title: "RERA Certification", h: 500, src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" },
  { id: "gc4", cat: "Gated Communities", title: "Serene Grove", h: 560, src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80" },
  { id: "a5", cat: "Apartments", title: "Marina Residences", h: 660, src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80" },
];

const STATIC_CATEGORIES: Category[] = ["All", "Apartments", "Plots", "Gated Communities", "Site Visits", "Events"];
const PAGE = 9;

function GalleryPage() {
  const { dark, toggle } = useDarkMode();
  useLenis();

  const { data: live } = useGalleryList();
  const items: Item[] = useMemo(() => {
    if (live && live.length > 0) {
      const heights = [520, 560, 620, 480, 660, 500, 700, 460, 540, 600, 640, 720, 580];
      return live.map((g, i) => ({ id: g.id, cat: g.category || "General", title: g.title, src: g.url, h: heights[i % heights.length], alt: g.alt }));
    }
    return IMAGES;
  }, [live]);

  const categories: Category[] = useMemo(() => {
    if (live && live.length > 0) {
      const set = new Set<string>(items.map((i) => i.cat));
      return ["All", ...Array.from(set)];
    }
    return STATIC_CATEGORIES;
  }, [live, items]);

  const [cat, setCat] = useState<Category>("All");
  const [visible, setVisible] = useState(PAGE);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () => (cat === "All" ? items : items.filter((i) => i.cat === cat)),
    [cat, items]
  );
  const shown = filtered.slice(0, visible);

  useEffect(() => { setVisible(PAGE); }, [cat]);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i == null ? i : (i - 1 + filtered.length) % filtered.length)), [filtered.length]);
  const next = useCallback(() => setLightbox((i) => (i == null ? i : (i + 1) % filtered.length)), [filtered.length]);

  useEffect(() => {
    if (lightbox == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, prev, next]);

  // swipe
  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) (dx > 0 ? prev() : next());
    setTouchX(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader />
      <ScrollProgress />
      <SiteHeader dark={dark} toggle={toggle} />

      <InnerPageHero
        image="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=80"
        eyebrow="Our Work"
        title="Gallery"
        subtitle="A visual walk through completed homes, planned communities and moments from our sites."
        crumbs={[{ label: "Home", to: "/" }, { label: "Gallery" }]}
      />


      {/* Filter chips */}
      <div className="sticky top-16 z-30 border-y border-black/5 bg-background/85 backdrop-blur dark:border-white/10 lg:top-20">
        <div className="mx-auto flex max-w-[1280px] gap-2 overflow-x-auto px-6 py-4 lg:px-10">
          {categories.map((c: string) => {
            const active = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap rounded-full border px-5 py-2 text-[12px] font-medium transition-colors ${
                  active
                    ? "border-transparent bg-ink-navy text-white dark:bg-white dark:text-[#101418]"
                    : "border-black/10 text-body hover:border-navy hover:text-ink dark:border-white/15 dark:hover:border-white/40 dark:hover:text-white"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry grid */}
      <section className="mx-auto max-w-[1280px] px-6 py-14 lg:px-10 lg:py-20">
        <LayoutGroup>
          <motion.div layout className="columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {shown.map((it, i) => (
                <motion.button
                  layout
                  key={it.id}
                  onClick={() => setLightbox(filtered.indexOf(it))}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (i % PAGE) * 0.04 }}
                  className="group relative mb-4 block w-full overflow-hidden text-left lg:mb-6"
                  style={{ breakInside: "avoid" }}
                >
                  <div className="relative overflow-hidden" style={{ height: it.h * 0.55 }}>
                    <img
                      src={it.src}
                      alt={it.alt || it.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-ink-navy/0 transition-colors duration-500 group-hover:bg-ink-navy/55" />
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-4 items-end justify-between p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/60">{it.cat}</div>
                        <div className="mt-1 font-display text-[20px] text-white">{it.title}</div>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#1E3A5F]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {visible < filtered.length && (
          <div className="mt-14 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE)}
              className="group inline-flex items-center gap-3 rounded-full border border-ink/20 px-8 py-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-navy hover:text-navy dark:border-white/25 dark:text-white dark:hover:border-white"
            >
              Load More
              <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </button>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="py-24 text-center text-body">Nothing in this category yet — check back soon.</div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md"
            onClick={close}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              onClick={(e) => { e.stopPropagation(); close(); }}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 md:left-8"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 md:right-8"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <motion.div
              key={lightbox}
              layoutId={`img-${filtered[lightbox].id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[86vh] max-w-[92vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={filtered[lightbox].src} alt={filtered[lightbox].alt || filtered[lightbox].title} className="max-h-[86vh] max-w-[92vw] object-contain" />
              <div className="mt-4 flex items-center justify-between text-white/80">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">{filtered[lightbox].cat}</div>
                  <div className="mt-1 font-display text-[20px] text-white">{filtered[lightbox].title}</div>
                </div>
                <div className="text-[12px] tabular-nums text-white/60">
                  {String(lightbox + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteFooter />
    </div>
  );
}
