import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logoDarkBg from "../assets/dark_theme_logo.png";
import logoLightBg from "../assets/light_theme_logo.png";
import { Reveal, WordReveal, LettersReveal, Magnetic, useLenis } from "../components/motion";
import { FAQ } from "../components/FAQ";
import { FloatingActions } from "../components/FloatingActions";
import { SiteHeader, Preloader, ScrollProgress } from "../components/SiteChrome";
import { SiteVisitProvider, openSiteVisit } from "../components/SiteVisitDialog";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { pageMeta, ldScript, faqLd, aggregateRatingLd } from "../lib/seo";
import { PropertyDetailsDrawer } from "../components/PropertyDetailsDrawer";
import { FAQ_GROUPS } from "../lib/faqs";
import { useHeroConfig, useTestimonials } from "../lib/queries";
import { usePropertiesList } from "../lib/data-adapters";
import type { TestimonialDoc } from "../lib/firestore/types";

export const Route = createFileRoute("/")({
  head: () => {
    const seo = pageMeta({
      title: "Best Real Estate Company in Kakinada | Swamy Reality Developers",
      description:
        "RERA, KAUDA & DTCP approved plots, apartments and gated communities in Kakinada — Sarpavaram, Ramanayapeta, JNTU area. 15+ years of trusted development.",
      path: "/",
    });
    const faqItems = FAQ_GROUPS.flatMap((g) => g.items as ReadonlyArray<{ q: string; a: string }>)
      .slice(0, 8)
      .map((it) => ({ q: it.q, a: it.a }));
    return {
      ...seo,
      links: [
        ...(seo.links ?? []),
        {
          rel: "preload",
          as: "image",
          href: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=80",
          fetchpriority: "high",
        },
      ],
      scripts: [
        ldScript(faqLd(faqItems)),
        ldScript(
          aggregateRatingLd({
            rating: 4.9,
            count: 210,
          }),
        ),
      ],
    };
  },
  component: Index,
});

// ------------------------------------------------------------------
// Data
// ------------------------------------------------------------------
const HERO_SLIDES = [
  {
    n: "01",
    name: "Sri Sri Residency",
    type: "Luxury Apartments",
    location: "Ramanayapeta",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=80",
  },
  {
    n: "02",
    name: "Mahatma Enclave",
    type: "Gated Community",
    location: "Sashikanth Nagar",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
  },
  {
    n: "03",
    name: "Swamy Satya Venkata Gardens",
    type: "Premium Plots",
    location: "Cheediga",
    img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=80",
  },
  {
    n: "04",
    name: "Lalitha Vihar",
    type: "Residential Plots",
    location: "Kakinada",
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=80",
  },
];

const PROJECTS = [
  {
    name: "Mahatma Enclave",
    type: "Gated Community",
    location: "Sashikanth Nagar",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    span: 2,
  },
  {
    name: "Sri Sri Residency",
    type: "Apartments",
    location: "Ramanayapeta",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Krishna Nagar",
    type: "Plots",
    location: "Kakinada",
    img: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Venkata Vihar",
    type: "Plots",
    location: "Kakinada",
    img: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Lalitha Vihar",
    type: "Plots",
    location: "Kakinada",
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Swamy Satya Venkata Gardens",
    type: "Premium Plots",
    location: "Cheediga",
    img: "https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=1200&q=80",
  },
];

const ADVANTAGES = [
  { n: "01", t: "Quality Construction", d: "Every wall, beam and finish executed to specifications that outlast decades of Kakinada's coastal climate." },
  { n: "02", t: "RERA & KAUDA Approvals", d: "Every project is regulator-cleared before a single brick is laid — full compliance, zero grey area." },
  { n: "03", t: "Gated Communities", d: "Planned neighborhoods with 24/7 security, wide roads, underground utilities and shared green spaces." },
  { n: "04", t: "Prime Locations", d: "Curated plots within walking distance of schools, hospitals and Kakinada's fastest-growing corridors." },
  { n: "05", t: "Transparent Documentation", d: "Clear titles, straightforward pricing, no hidden clauses — the paper trail is as clean as the property." },
  { n: "06", t: "Post-Sale Support", d: "A relationship that begins at handover — registration, utilities, resale guidance, all handled in-house." },
];

const TESTIMONIALS = [
  { q: "Swamy Reality Developers made buying our first home effortless. Clean documentation, no surprises, and a team that actually calls back.", n: "Care Health" },
  { q: "The gated community layout is exactly as promised. Wide roads, quiet plots, and the location has only appreciated since we bought.", n: "Prem Hruthik" },
  { q: "Fifteen years of trust in Kakinada is not a marketing line — it is what the neighbors will tell you. Highly recommended.", n: "K DSP" },
];

// ------------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------------
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("swamy-theme") : null;
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("swamy-theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

// ------------------------------------------------------------------
// Header
// ------------------------------------------------------------------
function Header({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Home", "Properties", "About", "Gallery", "Contact"];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-[#0f1520]/95 backdrop-blur border-b border-black/5 dark:border-white/10 shadow-[0_1px_20px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10 lg:py-5">
        <a href="#" className="flex items-center gap-3">
          <img
            src={scrolled && !dark ? logoLightBg : logoDarkBg}
            alt="Swamy Reality Developers"
            className={`w-auto transition-all duration-300 ${scrolled ? "h-9 md:h-10 lg:h-11" : "h-12 md:h-14 lg:h-16"}`}
          />
        </a>
        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className={`text-[13px] font-medium tracking-wide transition-colors ${
                scrolled ? "text-[#101418] dark:text-[#f2f4f8] hover:text-navy dark:hover:text-white" : "text-white/85 hover:text-white"
              }`}
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`hidden h-9 w-9 items-center justify-center rounded-full border transition-colors md:flex ${
              scrolled ? "border-black/10 text-ink hover:bg-black/5" : "border-white/25 text-white hover:bg-white/10"
            }`}
          >
            {dark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => openSiteVisit({ source: "home-header" })}
            style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
            className="hidden rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors hover:opacity-90 md:inline-flex"
          >
            Book Site Visit
          </button>
        </div>
      </div>
    </header>
  );
}

// ------------------------------------------------------------------
// Hero
// ------------------------------------------------------------------
function Hero() {
  const { data: config } = useHeroConfig();
  const slides = config?.slides && config.slides.length > 0 ? config.slides : HERO_SLIDES;
  const title1 = config?.title1 || "Building Homes.";
  const title2 = config?.title2 || "Creating Futures.";
  const subtitle = config?.subtitle || "RERA & KAUDA approved plots, apartments and gated communities in Kakinada.";

  const [i, setI] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setI((p) => (p + 1) % slides.length);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const go = (d: number) => {
    setI((p) => (p + d + slides.length) % slides.length);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
  };

  const slide = slides[i] || slides[0];

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-black">
      {slides.map((s, idx) => {
        const desktopSrc = (s as any).image?.url || (s as any).img;
        const mobileSrc = (s as any).mobileImage?.url || desktopSrc;
        return (
          <div
            key={s.n}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Desktop image — hidden on mobile */}
            <img
              src={desktopSrc}
              alt={s.name}
              className={`hidden md:block h-full w-full object-cover ${idx === i ? "kenburns" : ""}`}
            />
            {/* Mobile image — shown only on small screens */}
            <img
              src={mobileSrc}
              alt={s.name}
              className={`md:hidden h-full w-full object-cover ${idx === i ? "kenburns" : ""}`}
            />
          </div>
        );
      })}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/75 via-black/45 to-black/20" />
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{ backgroundColor: "rgba(30,58,95,0.15)" }}
      />

      {/* Bottom-left content */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1280px] flex-col justify-center px-6 pt-24 pb-16 lg:px-10 lg:pt-28 lg:pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mb-6 flex items-center gap-3 text-white/85"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#1E3A5F" }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
              Swamy Reality Developers · Kakinada
            </span>
          </motion.div>
          <h1
            className="font-display text-white text-[38px] leading-[1.04] sm:text-6xl lg:text-[92px]"
            aria-label="Building Homes. Creating Futures."
          >
            <span aria-hidden="true">
              <LettersReveal text={title1} delay={0.25} />
              <br />
              <span className="italic font-light text-white/70 block text-[28px] sm:text-[52px] lg:text-[76px]">
                <LettersReveal text={title2} delay={0.7} />
              </span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.3 }}
            className="mt-6 max-w-xl text-[15px] text-white/75 lg:text-base"
          >
            {subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.45 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <a
              href="#projects"
              style={{ backgroundColor: "#ffffff", color: "#1E3A5F" }}
              className="btn-shine group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span>Explore Properties</span>
              <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
            <button
              type="button"
              onClick={() => openSiteVisit({ source: "home-hero" })}
              style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.7)" }}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[13px] font-semibold transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Book Free Site Visit
            </button>
          </motion.div>
        </div>

        {/* Scroll hint — hidden on short viewports; decorative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 bottom-4 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/70 [@media(min-height:640px)]:flex sm:bottom-8 sm:gap-2"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] sm:text-[10px]">Scroll</span>
          <div className="scroll-hint-line" />
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>

        </motion.div>

        {/* Bottom-right slide info */}
        <div className="pointer-events-none absolute bottom-24 right-6 hidden text-right text-white lg:block lg:right-10">
          <div className="font-display text-[64px] leading-none">
            {slide.n}
            <span className="mx-2 text-white/40">—</span>
            <span className="text-white/40">0{slides.length}</span>
          </div>
          <div className="mt-4 font-display text-2xl">{slide.name}</div>
          <div className="mt-1 text-[12px] uppercase tracking-[0.2em] text-white/70">
            {slide.type} · {slide.location}
          </div>
          <div className="ml-auto mt-5 h-px w-48 bg-white/30" />
          <button
            onClick={() => go(1)}
            className="pointer-events-auto mt-5 ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:bg-white hover:text-black"
            aria-label="Next slide"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </div>

        {/* progress bars */}
        <div className="mt-10 flex items-center gap-3">
          {slides.map((_, idx) => (
            <div key={idx} className="h-[2px] flex-1 max-w-[60px] bg-white/25 overflow-hidden">
              <div
                key={idx === i ? `on-${i}` : `off-${idx}`}
                className="h-full bg-white"
                style={{
                  width: idx === i ? "100%" : idx < i ? "100%" : "0%",
                  transition: idx === i ? "width 6s linear" : "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* prev / next side arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous"
        className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 lg:flex"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next"
        className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 lg:flex"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </button>
    </section>
  );
}

// ------------------------------------------------------------------
// Marquee
// ------------------------------------------------------------------
function Marquee() {
  const items = [
    "RERA APPROVED",
    "KAUDA APPROVED",
    "DTCP LAYOUTS",
    "200+ HAPPY FAMILIES",
    "CLEAR TITLES",
    "6 PROJECTS DELIVERED",
  ];
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div className="bg-ink-navy overflow-hidden py-4">
      <div className="animate-marquee flex whitespace-nowrap">
        {doubled.map((t, i) => (
          <span key={i} className="mx-8 text-[11px] font-medium uppercase tracking-[0.3em] text-white/75">
            {t} <span className="ml-8 text-white/30">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// About Split
// ------------------------------------------------------------------
function About() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-[120px]">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="reveal">
          <div className="eyebrow">Who We Are</div>
          <h2 className="mt-5 font-display text-[38px] text-ink lg:text-[52px]">
            Kakinada's Most <span className="text-navy">Trusted</span> Real Estate Developer
          </h2>
          <p className="mt-7 text-[15px] leading-[1.75] text-body lg:text-[17px]">
            For over fifteen years, Swamy Reality Developers has quietly shaped the
            neighborhoods where Kakinada families put down roots. Every plot, every
            apartment, every gated layout carries the same standard — regulator-approved,
            clean-titled, and built to last generations.
          </p>
          <p className="mt-5 text-[15px] leading-[1.75] text-body lg:text-[17px]">
            We are a family-run firm with a deliberately small portfolio and a
            deliberately long horizon. What we build, we would gladly buy ourselves.
          </p>
          <a href="#" className="link-underline mt-9 inline-flex text-[13px] font-medium text-ink">
            About Us <span aria-hidden>→</span>
          </a>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            {[
              { n: 200, s: "+", l: "Clients" },
              { n: 6, s: "", l: "Projects" },
              { n: 4, s: "", l: "Ongoing" },
            ].map((it, idx) => (
              <div key={it.l} className="flex items-center gap-6">
                {idx > 0 && <div className="h-8 w-px bg-black/10 dark:bg-white/10" />}
                <div>
                  <div className="font-display text-3xl text-ink dark:text-white">
                    <CountUp to={it.n} suffix={it.s} />
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-body">{it.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          className="reveal relative min-h-[520px]"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <motion.div
            className="absolute right-0 top-0 h-[70%] w-[75%] overflow-hidden rounded-2xl"
            variants={{ rest: { y: 0, rotate: 0 }, hover: { y: -8, rotate: 0.6 } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
              alt="Modern apartment"
              className="h-full w-full object-cover"
              variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-0 h-[55%] w-[60%] overflow-hidden rounded-2xl border-8 border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] dark:border-[#141b27]"
            variants={{ rest: { y: 0, rotate: 0 }, hover: { y: 8, rotate: -0.6 } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
              alt="Gated community"
              className="h-full w-full object-cover"
              variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
          <motion.div
            className="absolute right-4 bottom-8 rounded-2xl px-6 py-5 text-white shadow-2xl"
            style={{ backgroundColor: "#1E3A5F" }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="font-display text-3xl leading-none">
              <CountUp to={15} suffix="+" />
            </div>
            <div className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-white/75">
              Years of Excellence
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Projects
// ------------------------------------------------------------------
function Projects() {
  const { data: properties } = usePropertiesList();
  const featured = properties.slice(0, 6);
  const [selected, setSelected] = useState<(typeof properties)[number] | null>(null);
  return (
    <section id="projects" className="bg-warm-gray py-20 lg:py-[120px]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="reveal">
            <div className="eyebrow">Our Portfolio</div>
            <h2 className="mt-5 font-display text-[38px] text-ink lg:text-[52px]">
              <WordReveal text="Featured Projects" />
            </h2>
          </div>
          <Link to="/properties" className="link-underline text-[13px] font-medium text-ink">
            View All <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:auto-rows-[minmax(280px,1fr)] lg:gap-8">
          {featured.map((p, i) => {
            const big = i === 0;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => setSelected(p)}
                data-reveal={i % 2 === 0 ? "up" : "scale"}
                className={`group reveal relative block w-full overflow-hidden rounded-2xl bg-black text-left ${
                  big ? "md:col-span-2 md:row-span-2" : ""
                } ${big ? "" : "aspect-[4/5]"}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img
                  src={p.images[0]}
                  alt={p.imageAlts?.[0] || p.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1E3A5F] dark:!text-[#1E3A5F]">
                  {p.type}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 lg:p-7">
                  <div>
                    <h3 className="font-display text-2xl text-white lg:text-[26px]">{p.name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-white/80">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {p.location}
                    </div>
                  </div>
                  <div className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/50 bg-black/20 text-white transition-all duration-500 group-hover:border-transparent group-hover:bg-navy group-hover:rotate-45">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8"/></svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
      <PropertyDetailsDrawer property={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

// ------------------------------------------------------------------
// Why Choose Us — animated vertical timeline
// ------------------------------------------------------------------
function WhyUs() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start 75%", "end 60%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-[120px]">
      <div className="mb-16 max-w-2xl reveal">
        <div className="eyebrow">The Swamy Advantage</div>
        <h2 className="mt-5 font-display text-[38px] text-ink lg:text-[52px]">
          <WordReveal text="A quieter kind of confidence." />
        </h2>
        <p className="mt-5 text-[15px] leading-[1.75] text-body">
          Six principles that shape every project — scroll to explore.
        </p>
      </div>

      <div ref={wrapRef} className="relative">
        {/* Track (static) */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-4 w-px bg-black/10 dark:bg-white/10 md:left-1/2 md:-translate-x-1/2"
        />
        {/* Progress fill */}
        <motion.div
          aria-hidden
          className="absolute top-0 left-4 w-[2px] origin-top bg-navy dark:bg-white md:left-1/2 md:-translate-x-1/2"
          style={{ scaleY: lineScale, height: "100%" }}
        />

        <ul className="relative space-y-12 md:space-y-20">
          {ADVANTAGES.map((a, i) => {
            const left = i % 2 === 0;
            return (
              <li key={a.n} className="relative md:grid md:grid-cols-2 md:gap-12">
                {/* Dot */}
                <motion.span
                  aria-hidden
                  className="absolute left-4 top-2 z-10 -translate-x-1/2 md:left-1/2"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                >
                  <span className="block h-3.5 w-3.5 rounded-full bg-navy ring-4 ring-white dark:bg-white dark:ring-ink-navy" />
                </motion.span>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`pl-12 md:pl-0 ${left ? "md:col-start-1 md:pr-14 md:text-right" : "md:col-start-2 md:pl-14"}`}
                >
                  <div className="font-display text-5xl text-navy/15 dark:text-white/20 lg:text-6xl">{a.n}</div>
                  <h3 className="mt-3 font-display text-[22px] text-navy lg:text-[26px]">{a.t}</h3>
                  <p className="mt-3 text-[14.5px] leading-[1.75] text-body">{a.d}</p>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Stats band with count-up
// ------------------------------------------------------------------
function CountUp({ to, suffix = "", duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{n}{suffix}</span>;
}

function Stats() {
  const items = [
    { n: 200, s: "+", l: "Happy Families" },
    { n: 6, s: "", l: "Projects Delivered" },
    { n: 4, s: "", l: "Ongoing" },
    { n: 100, s: "%", l: "Clear Titles" },
  ];
  return (
    <section className="relative overflow-hidden bg-ink-navy py-16 sm:py-20 lg:py-[120px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {items.map((it, i) => (
            <motion.div
              key={it.l}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-center sm:text-left"
            >
              <div className="font-display text-[44px] leading-none text-white sm:text-6xl lg:text-[86px]">
                <CountUp to={it.n} suffix={it.s} />
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/55 sm:text-[11px] sm:tracking-[0.22em]">
                {it.l}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Testimonials — 3D carousel (desktop) + swipe cards (mobile)
// ------------------------------------------------------------------
type TItem = { name: string; role?: string; quote: string; rating: number; avatarUrl?: string };

function Testimonials() {
  const { data } = useTestimonials();
  const items: TItem[] = (data && data.length > 0)
    ? data.map((t: TestimonialDoc) => ({
        name: t.name, role: t.role, quote: t.quote, rating: t.rating || 5,
        avatarUrl: t.avatar?.url,
      }))
    : TESTIMONIALS.map((t) => ({ name: t.n, quote: t.q, rating: 5 }));

  const [active, setActive] = useState(0);
  const count = items.length;
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Autoplay
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), 6500);
    return () => clearInterval(id);
  }, [count]);

  const go = (dir: 1 | -1) => setActive((a) => (a + dir + count) % count);

  // Desktop 3D carousel activates only when we have more than 1 item AND desktop viewport
  const use3D = isDesktop && count > 1;

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-[120px]">
      <div className="mb-14 reveal">
        <div className="eyebrow">Client Stories</div>
        <h2 className="mt-5 font-display text-[38px] text-ink lg:text-[52px]">
          <WordReveal text="What Our Clients Say" />
        </h2>
      </div>

      {count === 0 ? (
        <div className="rounded-2xl border border-black/10 p-10 text-center text-body">
          Client stories will appear here soon.
        </div>
      ) : use3D ? (
        <Carousel3D items={items} active={active} setActive={setActive} onNav={go} />
      ) : (
        <MobileCarousel items={items} active={active} setActive={setActive} onNav={go} />
      )}
    </section>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5" style={{ color: "#E8B04B" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3 6.9 7.6.6-5.8 5 1.8 7.4L12 17.9 5.4 21.9 7.2 14.5 1.4 9.5 9 8.9z" />
        </svg>
      ))}
    </div>
  );
}

function TCard({ t }: { t: TItem }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,21,35,0.35)] dark:border-white/10 dark:bg-white/[0.03] lg:p-10">
      <div className="font-display text-6xl leading-none text-navy">“</div>
      <p className="mt-3 flex-1 text-[15.5px] leading-[1.75] text-ink">{t.quote}</p>
      <div className="mt-6"><Stars n={t.rating} /></div>
      <div className="mt-6 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
        {t.avatarUrl ? (
          <img src={t.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-navy/10 font-display text-sm text-navy dark:bg-white/10 dark:text-white">
            {t.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy">{t.name}</div>
          {t.role && <div className="text-[11px] text-body">{t.role}</div>}
        </div>
      </div>
    </div>
  );
}

function Carousel3D({
  items, active, setActive, onNav,
}: { items: TItem[]; active: number; setActive: (n: number) => void; onNav: (dir: 1 | -1) => void }) {
  const count = items.length;
  return (
    <div className="relative">
      <div
        className="relative mx-auto flex h-[440px] items-center justify-center"
        style={{ perspective: "1400px" }}
      >
        {items.map((t, i) => {
          let offset = i - active;
          // wrap for shortest path
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const abs = Math.abs(offset);
          const visible = abs <= 2;
          return (
            <motion.div
              key={i}
              className="absolute w-[min(520px,88vw)]"
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                x: offset * 260,
                z: -abs * 200,
                rotateY: offset * -22,
                scale: 1 - abs * 0.08,
                opacity: visible ? (abs === 0 ? 1 : 0.55) : 0,
                zIndex: 10 - abs,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => offset !== 0 && setActive(i)}
              role={offset === 0 ? undefined : "button"}
              aria-hidden={!visible}
              
            >
              <div className={offset === 0 ? "" : "cursor-pointer"}>
                <TCard t={t} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => onNav(-1)}
          aria-label="Previous testimonial"
          className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white text-navy transition hover:bg-navy hover:text-white dark:border-white/15 dark:bg-white/5 dark:text-white"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === active ? 28 : 8,
                background: i === active ? "var(--tw-c-navy, #1E3A5F)" : "rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => onNav(1)}
          aria-label="Next testimonial"
          className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white text-navy transition hover:bg-navy hover:text-white dark:border-white/15 dark:bg-white/5 dark:text-white"
        >
          →
        </button>
      </div>
    </div>
  );
}

function MobileCarousel({
  items, active, setActive, onNav,
}: { items: TItem[]; active: number; setActive: (n: number) => void; onNav: (dir: 1 | -1) => void }) {
  return (
    <div>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) onNav(1);
              else if (info.offset.x > 60) onNav(-1);
            }}
            className="mx-auto max-w-xl"
          >
            <TCard t={items[active]} />
          </motion.div>
        </AnimatePresence>
      </div>
      {items.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === active ? 24 : 8,
                background: i === active ? "#1E3A5F" : "rgba(0,0,0,0.18)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// ------------------------------------------------------------------
// CTA
// ------------------------------------------------------------------
function CTA() {
  return (
    <section id="contact" className="px-4 pb-20 lg:px-8 lg:pb-[120px]">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-3xl">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(11,21,35,0.92), rgba(30,58,95,0.75))" }} />
        <div className="relative px-8 py-20 text-center text-white lg:px-16 lg:py-28">
          <div className="eyebrow" style={{ color: "#E8B04B" }}>Get In Touch</div>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-[42px] leading-[1.05] lg:text-[68px]">
            Book Your Free Site Visit
          </h2>
          <a href="tel:+919989778222" className="mt-8 block font-display text-3xl text-white/90 lg:text-5xl">
            +91 99897 78222
          </a>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openSiteVisit({ source: "home-cta" })}
              style={{ backgroundColor: "#ffffff", color: "#1E3A5F" }}
              className="rounded-full px-7 py-3.5 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 hover:opacity-90"
            >
              Book Site Visit
            </button>
            <a href="tel:+919989778222" style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }} className="rounded-full px-7 py-3.5 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 hover:opacity-90 border border-white/20">
              Call Now
            </a>
            <a
              href="https://wa.me/919989778222"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-medium text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.9 11.9 0 0 0 3 20l-1 4 4.1-1.1A12 12 0 1 0 20.5 3.5zM12 21.4a9.4 9.4 0 0 1-4.8-1.3l-.3-.2-2.4.6.7-2.3-.2-.4A9.4 9.4 0 1 1 12 21.4zm5.4-7c-.3-.2-1.7-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a7.7 7.7 0 0 1-2.3-1.4 8.5 8.5 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.6-.7-1.7-1-2.3-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6c0 1.5 1.1 3 1.3 3.2s2.2 3.4 5.4 4.8a17.6 17.6 0 0 0 1.8.7 4.3 4.3 0 0 0 2 .1 3.2 3.2 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Footer
// ------------------------------------------------------------------
function Footer() {
  return (
    <footer className="bg-ink-navy text-white/70">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <img
              src={logoDarkBg}
              alt="Swamy Reality Developers"
              className="h-12 w-auto"
            />
            <p className="mt-6 max-w-xs text-[14px] leading-[1.7] text-white/60">
              Building Homes. Creating Futures. Kakinada's trusted name in premium plots,
              apartments and gated communities for over fifteen years.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="https://www.facebook.com/swamyrealitydeveloperskakinada"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://www.instagram.com/swamy_reality_developers"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a
                href="https://www.youtube.com/@swamyrealitydevelopers6092"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Quick Links</div>
            <ul className="mt-6 space-y-3 text-[14px]">
              {["Home","Properties","About Us","Gallery","Blog","FAQ","Contact Us"].map((l) => (
                <li key={l}><a href="#" className="text-white/75 hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Services</div>
            <ul className="mt-6 space-y-3 text-[14px]">
              {["Residential Plots","Apartments","Gated Communities","Custom Construction"].map((l) => (
                <li key={l}><a href="#" className="text-white/75 hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Contact</div>
            <ul className="mt-6 space-y-4 text-[14px] leading-[1.7] text-white/75">
              <li>Jawahar St, near Nookalamma Temple,<br/>Rama Rao Peta, Kakinada</li>
              <li><a href="tel:+919989778222" className="hover:text-white">+91 99897 78222</a></li>
              <li><a href="mailto:sales@swamyrealitydevelopers.com" className="hover:text-white break-all">sales@swamyrealitydevelopers.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-[12px] text-white/50">
          <div>© 2026 Swamy Reality Developers. All rights reserved.</div>
          <div>
            Designed &amp; Developed by{" "}
            <a
              href="https://thedreamteamservices.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              DREAM TEAM SERVICES
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------
// Preloader and ScrollProgress imported from SiteChrome

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------
function Index() {
  const { dark, toggle } = useDarkMode();
  useReveal();
  useLenis();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader />
      <ScrollProgress />
      <SiteHeader dark={dark} toggle={toggle} />
      <Hero />
      <Marquee />
      <About />
      <Projects />
      <WhyUs />
      <Stats />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
      <FloatingActions />
      <SiteVisitProvider />
    </div>
  );
}

