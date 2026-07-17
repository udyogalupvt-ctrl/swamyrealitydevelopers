import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoDarkBg from "../assets/dark_theme_logo.png";
import logoLightBg from "../assets/light_theme_logo.png";

export function useDarkMode() {
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

const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Properties", to: "/properties" as const },
  { label: "About Us", to: "/about" as const },
  { label: "Gallery", to: "/gallery" as const },
  { label: "Blog", to: "/blog" as const },
  { label: "FAQ", to: "/faq" as const },
  { label: "Contact Us", to: "/contact" as const },
];

export function SiteHeader({
  dark,
  toggle,
  solid = false,
}: {
  dark: boolean;
  toggle: () => void;
  solid?: boolean;
}) {
  const [scrolled, setScrolled] = useState(solid);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (solid) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  // Lock body scroll + Escape to close when drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const logoSrc = scrolled && !dark ? logoLightBg : logoDarkBg;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-[#0f1520]/95 backdrop-blur border-b border-black/5 dark:border-white/10 shadow-[0_1px_20px_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        }`}
        style={{ pointerEvents: "auto" }}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-10 lg:py-5">
          <Link to="/" className="flex items-center gap-3" aria-label="Swamy Reality Developers home">
            <img
              src={logoSrc}
              alt="Swamy Reality Developers"
              className={`w-auto transition-all duration-300 ${
                solid ? "h-9 md:h-10 lg:h-11" : scrolled ? "h-9 md:h-10 lg:h-11" : "h-11 md:h-12 lg:h-14"
              }`}
            />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {NAV.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={`relative text-[13px] font-medium tracking-wide transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full data-[status=active]:font-semibold data-[status=active]:after:w-full ${
                  scrolled
                    ? "text-[#101418] dark:text-[#f2f4f8] hover:text-navy dark:hover:text-white data-[status=active]:text-navy dark:data-[status=active]:text-white"
                    : "text-white/85 hover:text-white data-[status=active]:text-white"
                }`}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className={`hidden h-10 w-10 items-center justify-center rounded-full border transition-colors lg:flex ${
                scrolled
                  ? "border-black/10 text-ink hover:bg-black/5 dark:border-white/15 dark:text-white"
                  : "border-white/25 text-white hover:bg-white/10"
              }`}
            >
              {dark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <Link
              to="/contact"
              style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
              className="hidden rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors hover:opacity-90 lg:inline-flex"
            >
              Book Site Visit
            </Link>

            {/* Hamburger — mobile & tablet */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className={`inline-flex h-11 w-11 items-center justify-center lg:hidden ${
                scrolled ? "text-ink dark:text-white" : "text-white"
              }`}

            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 top-0 h-[2px] w-full bg-current transition-all duration-300 ${
                    open ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-[2px] w-full bg-current transition-all duration-200 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-[2px] w-full bg-current transition-all duration-300 ${
                    open ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={open} onClose={() => setOpen(false)} dark={dark} toggle={toggle} />
    </>
  );
}

function MobileDrawer({
  open,
  onClose,
  dark,
  toggle,
}: {
  open: boolean;
  onClose: () => void;
  dark: boolean;
  toggle: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/50 lg:hidden"
          />
          <motion.div
            key="panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-y-0 right-0 z-[90] flex w-full max-w-[420px] flex-col lg:hidden ${
              dark ? "bg-[#0B1523] text-white" : "bg-white text-[#101418]"
            }`}
          >
            <div className={`flex items-center justify-between px-6 py-5 border-b ${dark ? "border-white/10" : "border-black/10"}`}>
              <Link to="/" onClick={onClose} className="flex items-center">
                <img src={dark ? logoDarkBg : logoLightBg} alt="Swamy Reality Developers" className="h-10 w-auto" />
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border ${
                  dark ? "border-white/20 text-white" : "border-black/15 text-[#101418]"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-6 py-8 overflow-y-auto">
              {NAV.map((l, idx) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + idx * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={l.to}
                    onClick={onClose}
                    className={`block py-4 pl-3 font-display text-[28px] leading-tight border-b border-l-2 border-l-transparent transition-colors ${
                      dark ? "text-white border-white/10" : "text-[#101418] border-black/10"
                    } ${dark ? "data-[status=active]:text-[#7fa8d6] data-[status=active]:border-l-[#7fa8d6]" : "data-[status=active]:text-[#1E3A5F] data-[status=active]:border-l-[#1E3A5F]"}`}
                    activeOptions={{ exact: l.to === "/" }}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className={`border-t px-6 py-6 space-y-4 ${dark ? "border-white/10" : "border-black/10"}`}>
              <button
                onClick={toggle}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium tracking-wide ${
                  dark ? "border-white/20 text-white/90" : "border-black/15 text-[#101418]"
                }`}
              >
                {dark ? "Light mode" : "Dark mode"}
              </button>
              <a href="tel:+919989778222" className={`block text-[14px] ${dark ? "text-white/70" : "text-[#101418]/70"}`}>
                +91 99897 78222
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+919989778222"
                  className="flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold text-white"
                  style={{ backgroundColor: "#1E3A5F" }}
                >
                  Call Now
                </a>
                <a
                  href="https://wa.me/919989778222"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold text-white"
                  style={{ backgroundColor: "#22c55e" }}
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink-navy text-white/70" data-site-footer>
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <img src={logoDarkBg} alt="Swamy Reality Developers" className="h-12 w-auto" />
            <p className="mt-6 max-w-xs text-[14px] leading-[1.7] text-white/60">
              Building Homes. Creating Futures. Kakinada's trusted name in premium plots,
              apartments and gated communities for over fifteen years.
            </p>
            <div className="mt-8 flex gap-3">
              {["FB", "IG", "IN", "YT"].map((s) => (
                <a key={s} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[11px] text-white/70 transition-colors hover:border-white hover:text-white">
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Quick Links</div>
            <ul className="mt-6 space-y-3 text-[14px]">
              <li><Link to="/" className="text-white/75 hover:text-white">Home</Link></li>
              <li><Link to="/properties" className="text-white/75 hover:text-white">Properties</Link></li>
              <li><Link to="/about" className="text-white/75 hover:text-white">About Us</Link></li>
              <li><Link to="/gallery" className="text-white/75 hover:text-white">Gallery</Link></li>
              <li><Link to="/blog" className="text-white/75 hover:text-white">Blog</Link></li>
              <li><Link to="/faq" className="text-white/75 hover:text-white">FAQ</Link></li>
              <li><Link to="/contact" className="text-white/75 hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Services</div>
            <ul className="mt-6 space-y-3 text-[14px]">
              {["Residential Plots","Apartments","Gated Communities","Custom Construction"].map((l) => (
                <li key={l}><Link to="/properties" className="text-white/75 hover:text-white">{l}</Link></li>
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

let preloaderShownThisSession = false;

export function Preloader() {
  const [gone, setGone] = useState(preloaderShownThisSession);
  const [hide, setHide] = useState(false);
  const [pct, setPct] = useState(0);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (preloaderShownThisSession) return;
    preloaderShownThisSession = true;
    const stored = typeof window !== "undefined" ? localStorage.getItem("swamy-theme") : null;
    const dark = stored === "dark" || document.documentElement.classList.contains("dark");
    setIsDark(dark);
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const t1 = setTimeout(() => setHide(true), 1300);
    const t2 = setTimeout(() => setGone(true), 1900);
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (gone) return null;
  const bg = isDark ? "#0B1523" : "#ffffff";
  const logoSrc = isDark ? logoDarkBg : logoLightBg;
  const trackBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)";
  const fillBg = isDark ? "#7fa8d6" : "#1E3A5F";
  const pctColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(16,20,24,0.55)";
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={hide ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      style={{ backgroundColor: bg }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6"
    >
      <motion.img
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: [0.92, 1, 0.95, 1], scale: [0.94, 1.02, 0.98, 1] }}
        transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        src={logoSrc}
        alt="Swamy Reality Developers"
        className="h-20 w-auto md:h-28"
      />
      <div className="flex w-52 flex-col items-center gap-2">
        <div className="h-px w-full overflow-hidden" style={{ backgroundColor: trackBg }}>
          <div className="h-full transition-[width] duration-100" style={{ width: `${pct}%`, backgroundColor: fillBg }} />
        </div>
        <div className="text-[10px] font-medium uppercase tracking-[0.3em] tabular-nums" style={{ color: pctColor }}>
          {String(pct).padStart(3, "0")}%
        </div>
      </div>
    </motion.div>
  );
}

export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      setP(Math.min(1, Math.max(0, scrolled)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[60] h-[2px] w-full bg-transparent">
      <div className="h-full origin-left bg-[#1E3A5F] transition-[width] duration-150" style={{ width: `${p * 100}%` }} />
    </div>
  );
}

/**
 * Slim overlay shown between route navigations for a smooth cross-page transition.
 * Uses TanStack Router's status to detect pending loads.
 */
export function RouteTransition() {
  const status = useRouterState({ select: (s) => s.status });
  const isLoading = useRouterState({ select: (s) => s.isLoading || s.isTransitioning });
  const [visible, setVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, [status]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isLoading) {
      // small delay so instant navigations don't flash
      t = setTimeout(() => setVisible(true), 80);
    } else {
      setVisible(false);
    }
    return () => t && clearTimeout(t);
  }, [isLoading]);

  const bg = isDark ? "#0B1523" : "#ffffff";
  const logoSrc = isDark ? logoDarkBg : logoLightBg;
  const barBg = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)";
  const fill = isDark ? "#7fa8d6" : "#1E3A5F";

  return (
    <>
      {/* top indeterminate bar — always mounts on nav */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="topbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 top-0 z-[95] h-[2px] w-full"
            style={{ backgroundColor: barBg }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
              className="h-full w-1/3"
              style={{ backgroundColor: fill }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* full overlay only if the load is longer than a moment */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ backgroundColor: bg }}
            className="fixed inset-0 z-[90] flex items-center justify-center"
          >
            <motion.img
              src={logoSrc}
              alt=""
              aria-hidden
              initial={{ scale: 0.94, opacity: 0.85 }}
              animate={{ scale: [0.94, 1.02, 0.96, 1], opacity: [0.85, 1, 0.9, 1] }}
              transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
              className="h-16 w-auto md:h-20"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 480);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="btt"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Back to top"
          className="fixed bottom-24 right-4 z-[80] flex h-11 w-11 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/35 md:bottom-8 md:right-8 md:h-12 md:w-12 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Contextual back button for detail pages. Uses history when possible,
 * otherwise falls back to the provided `to` route.
 */
export function BackButton({
  to = "/",
  label = "Back",
  className = "",
}: {
  to?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to });
    }
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:-translate-x-0.5 hover:text-navy dark:text-white/70 dark:hover:text-white ${className}`}
      aria-label={label}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

