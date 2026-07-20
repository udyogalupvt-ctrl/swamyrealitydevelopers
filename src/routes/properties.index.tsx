import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROPERTIES, PROPERTY_TYPES, type Property, type PropertyType } from "../lib/properties";
import { usePropertiesList } from "../lib/data-adapters";
import { SiteHeader, SiteFooter, Preloader, ScrollProgress, useDarkMode } from "../components/SiteChrome";
import { FloatingActions } from "../components/FloatingActions";
import { Reveal, WordReveal, useLenis } from "../components/motion";
import { InnerPageHero } from "../components/InnerPageHero";
import { ProjectsCoverflow } from "../components/ProjectsCoverflow";
import { PropertyDetailsDrawer } from "../components/PropertyDetailsDrawer";
import { pageMeta, ldScript, breadcrumbLd } from "../lib/seo";

export const Route = createFileRoute("/properties/")({
  component: PropertiesPage,
  head: () => {
    const seo = pageMeta({
      title: "Plots & Apartments for Sale in Kakinada | Swamy Reality Developers",
      description:
        "Explore DTCP & RERA approved plots, apartments and gated communities for sale in Kakinada — Sarpavaram, Ramanayapeta, JNTU area and more.",
      path: "/properties",
    });
    return {
      ...seo,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
          ]),
        ),
      ],
    };
  },
});

function PropertiesPage() {
  const { dark, toggle } = useDarkMode();
  useLenis();
  const [filter, setFilter] = useState<PropertyType | "All">("All");
  const [location, setLocation] = useState<string>("All");
  const [q, setQ] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { data: properties } = usePropertiesList();

  const locations = useMemo(() => {
    const set = new Set(properties.map((p) => p.location.split(",")[0]!.trim()));
    return ["All", ...Array.from(set)];
  }, [properties]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (filter !== "All" && p.type !== filter) return false;
      if (location !== "All" && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (q && !`${p.name} ${p.location} ${p.type}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [filter, location, q, properties]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader />
      <ScrollProgress />
      <SiteHeader dark={dark} toggle={toggle} />

      <InnerPageHero
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80"
        eyebrow="Our Portfolio"
        title="Properties in Kakinada"
        subtitle="A curated selection of apartments, gated communities and premium plots — every one regulator-approved, clean-titled and ready to visit."
        crumbs={[{ label: "Home", to: "/" }, { label: "Properties" }]}
      />

      <section className="mx-auto max-w-[1280px] px-6 pt-16 lg:px-10 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <aside className="lg:col-span-4">
            <Reveal>
              <div className="eyebrow">Quick Facts</div>
            </Reveal>
            <h2 className="mt-4 font-display text-[26px] leading-[1.15] text-ink dark:text-white lg:text-[32px]">
              <WordReveal text="Properties by Swamy Reality Developers in Kakinada" />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-4 text-[14px] leading-[1.7] text-body">
                Swamy Reality Developers is a real estate company in Kakinada, Andhra Pradesh, offering RERA, KAUDA and DTCP approved plots, apartments and gated communities.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <ul className="mt-6 space-y-2 text-[13.5px] leading-[1.7] text-body">
                <li><span className="font-semibold text-ink dark:text-white">Location:</span> Kakinada, Andhra Pradesh, India</li>
                <li><span className="font-semibold text-ink dark:text-white">Founded:</span> 15+ years of operation</li>
                <li><span className="font-semibold text-ink dark:text-white">Active projects:</span> {PROPERTIES.length}</li>
                <li><span className="font-semibold text-ink dark:text-white">Approvals:</span> RERA, KAUDA, DTCP</li>
                <li><span className="font-semibold text-ink dark:text-white">Specialities:</span> Gated communities, plots, apartments, custom construction</li>
                <li><span className="font-semibold text-ink dark:text-white">Contact:</span> +91 99897 78222</li>
              </ul>
            </Reveal>
          </aside>

          <div className="min-w-0 lg:col-span-8">
            <Reveal>
              <div className="eyebrow">Our Projects at a Glance</div>
            </Reveal>
            <h3 className="mt-4 font-display text-[22px] text-ink dark:text-white lg:text-[26px]">
              <WordReveal text="All active developments — name, location, type, approval and status" />
            </h3>
            <Reveal delay={0.2}>
              {/* Desktop / tablet: table */}
              <div className="mt-6 hidden w-full overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 sm:block">
                <table className="min-w-full border-collapse text-left text-[13.5px]">
                  <thead className="bg-black/[0.03] text-[11px] font-semibold uppercase tracking-[0.14em] text-ink dark:bg-white/5 dark:text-white">
                    <tr>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">RERA ID</th>
                      <th className="px-4 py-3">Approvals</th>
                    </tr>
                  </thead>
                  <tbody className="text-body">
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-body">
                          No properties match the current filters.
                        </td>
                      </tr>
                    )}
                    {filtered.map((p) => {
                      const approvals = [
                        p.approvals.rera ? "RERA" : null,
                        p.approvals.kauda ? "KAUDA" : null,
                        p.approvals.dtcp ? "DTCP" : null,
                      ].filter(Boolean).join(", ");
                      return (
                        <tr key={p.slug} className="border-t border-black/5 align-top dark:border-white/10">
                          <td className="px-4 py-3">
                            <Link to="/properties/$slug" params={{ slug: p.slug }} className="font-semibold text-ink hover:text-navy dark:text-white">
                              {p.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3">{p.location}</td>
                          <td className="px-4 py-3">{p.type}</td>
                          <td className="px-4 py-3 font-mono text-[12px]">{p.approvals.rera}</td>
                          <td className="px-4 py-3">{approvals}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: 3D coverflow carousel */}
              <div className="mt-8 sm:hidden">
                <ProjectsCoverflow items={filtered} onView={setSelectedProperty} />
              </div>
            </Reveal>

          </div>
        </div>
      </section>


      {/* Sticky filter bar */}
      <div className="sticky top-[68px] z-40 border-b border-black/5 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#0f1520]/90 lg:top-[76px]" role="region" aria-label="Property filters">
        <div className="mx-auto max-w-[1280px] space-y-3 px-4 py-4 sm:px-6 lg:flex lg:flex-wrap lg:items-center lg:gap-3 lg:space-y-0 lg:px-10">
          <div
            role="radiogroup"
            aria-label="Filter by property type"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:m-0 lg:flex-wrap lg:overflow-visible lg:p-0"
          >
            {PROPERTY_TYPES.map((t) => {
              const active = filter === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFilter(t)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0f1520] ${
                    active
                      ? "bg-[#1E3A5F] text-white"
                      : "border border-black/10 text-ink hover:border-[#1E3A5F] hover:text-navy dark:border-white/15 dark:text-white/80"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 lg:ml-auto">
            <label htmlFor="property-location" className="sr-only">Filter by location</label>
            <select
              id="property-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium text-ink outline-none transition-colors focus:border-[#1E3A5F] focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 dark:border-white/15 dark:bg-[#0f1520] dark:text-white/80 dark:focus-visible:ring-offset-[#0f1520]"
            >
              {locations.map((l) => (
                <option key={l} value={l}>{l === "All" ? "All locations" : l}</option>
              ))}
            </select>
            <div className="relative min-w-0 flex-1 lg:flex-none">
              <label htmlFor="property-search" className="sr-only">Search properties</label>
              <input
                id="property-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search properties…"
                aria-label="Search properties by name, location or type"
                className="w-full rounded-full border border-black/10 bg-white px-4 py-2 pl-9 text-[12px] text-ink outline-none transition-colors focus:border-[#1E3A5F] focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 dark:border-white/15 dark:bg-[#0f1520] dark:text-white/80 dark:placeholder:text-white/40 dark:focus-visible:ring-offset-[#0f1520] lg:w-52"
              />
              <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
          </div>
        </div>
      </div>


      {/* Grid */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <Reveal>
          <div className="mb-8 text-[13px] text-body">
            Showing <span className="font-semibold text-ink dark:text-white">{filtered.length}</span> of {properties.length} properties
          </div>
        </Reveal>


        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 py-24 text-center dark:border-white/15">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A5F]/10 text-navy dark:bg-white/10 dark:text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <h3 className="mt-6 font-display text-2xl text-ink dark:text-white">No properties found</h3>
            <p className="mt-2 text-[14px] text-body">Try adjusting your filters or search term.</p>
            <button
              onClick={() => { setFilter("All"); setLocation("All"); setQ(""); }}
              className="mt-6 rounded-full bg-[#1E3A5F] px-6 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: (i % 6) * 0.05 }}
                >
                  <PropertyCard property={p} onView={setSelectedProperty} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-20 lg:px-8 lg:pb-24">
        <Reveal>
          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-3xl">
            <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, #0B1523, #1E3A5F)" }} />
            <div className="relative flex flex-col items-center gap-6 px-8 py-16 text-center text-white lg:flex-row lg:justify-between lg:px-16 lg:text-left">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">Need help deciding?</div>
                <h2 className="mt-3 font-display text-3xl lg:text-[42px]">
                  <WordReveal text="Can't find what you're looking for?" />
                </h2>
                <p className="mt-3 max-w-xl text-[14px] text-white/70 lg:text-[15px]">
                  Our team knows every corner of Kakinada — tell us what you need and we'll shortlist the right project for you.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="tel:+919989778222" className="rounded-full bg-white px-6 py-3.5 text-[13px] font-semibold text-navy transition-transform hover:-translate-y-0.5">
                  Call +91 99897 78222
                </a>
                <a href="https://wa.me/919989778222" className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.9 11.9 0 0 0 3 20l-1 4 4.1-1.1A12 12 0 1 0 20.5 3.5z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>


      
      <SiteFooter />
      <FloatingActions />
      <PropertyDetailsDrawer property={selectedProperty} onClose={() => setSelectedProperty(null)} />
    </div>
  );
}

export function PropertyCard({ property: p, onView }: { property: Property; onView?: (property: Property) => void }) {
  const content = (
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={p.cardImage || p.images[0]}
          alt={p.imageAlts?.[0] || p.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1E3A5F]">
          {p.type}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 lg:p-7">
          <h3 className="font-display text-2xl text-white lg:text-[26px]">{p.name}</h3>
          <div className="mt-2 flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-white/80">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {p.location}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.amenities.slice(0, 3).map((a) => (
              <span key={a} className="rounded-full border border-white/25 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur">
                {a}
              </span>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/80">View Details</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white transition-all duration-500 group-hover:border-transparent group-hover:bg-[#1E3A5F] group-hover:rotate-45">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8"/></svg>
            </div>
          </div>
        </div>
      </div>
  );

  if (onView) {
    return (
      <button
        type="button"
        onClick={() => onView(p)}
        className="group relative block h-full w-full overflow-hidden rounded-2xl bg-black text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to="/properties/$slug"
      params={{ slug: p.slug }}
      className="group relative block h-full overflow-hidden rounded-2xl bg-black"
    >
      {content}
    </Link>
  );
}
