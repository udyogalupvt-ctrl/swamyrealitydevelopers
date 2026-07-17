import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import type { Property } from "../lib/properties";

type Props = {
  property: Property | null;
  onClose: () => void;
};

export function PropertyDetailsDrawer({ property, onClose }: Props) {
  const open = !!property;
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {property && (
        <motion.div
          key="pdd-root"
          className="pointer-events-none fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="false"
          aria-label={`${property.name} details`}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="pointer-events-auto absolute inset-x-0 bottom-0 top-[8dvh] flex flex-col overflow-hidden rounded-t-3xl bg-white text-ink shadow-2xl dark:bg-[#0f1520] dark:text-white sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:h-[88dvh] sm:max-h-[88vh] sm:w-[560px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 140 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="relative h-64 w-full shrink-0 overflow-hidden sm:h-64">
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="absolute inset-x-0 top-0 z-10 flex h-8 touch-none cursor-grab items-center justify-center active:cursor-grabbing sm:hidden"
              >
                <span className="mt-2 h-1.5 w-10 rounded-full bg-white/70 shadow" aria-hidden />
              </div>
              <img
                src={property.images[0]}
                alt={property.imageAlts?.[0] || property.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#101418] shadow-md transition-transform hover:scale-105"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="inline-block rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1E3A5F]">
                  {property.type}
                </span>
                <h2 className="mt-2 font-display text-[24px] leading-tight text-white sm:text-[28px]">
                  {property.name}
                </h2>
                <div className="mt-1 flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] text-white/85">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {property.location}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 overscroll-contain sm:px-7">
              <p className="text-[13.5px] leading-[1.7] text-body">{property.short}</p>

              <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[12.5px]">
                <dt className="font-semibold uppercase tracking-[0.14em] text-[10.5px] text-ink dark:text-white">RERA</dt>
                <dd className="min-w-0 break-all font-mono text-body">{property.approvals.rera}</dd>
                <dt className="font-semibold uppercase tracking-[0.14em] text-[10.5px] text-ink dark:text-white">Approvals</dt>
                <dd className="min-w-0 text-body">
                  {[
                    property.approvals.rera ? "RERA" : null,
                    property.approvals.kauda ? "KAUDA" : null,
                    property.approvals.dtcp ? "DTCP" : null,
                  ].filter(Boolean).join(" · ")}
                </dd>
              </dl>

              {property.highlights?.length > 0 && (
                <div className="mt-6">
                  <div className="eyebrow">Highlights</div>
                  <ul className="mt-3 space-y-2 text-[13px] leading-[1.6] text-body">
                    {property.highlights.slice(0, 5).map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#1E3A5F] dark:bg-white" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {property.amenities?.length > 0 && (
                <div className="mt-6">
                  <div className="eyebrow">Amenities</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {property.amenities.slice(0, 8).map((a) => (
                      <span
                        key={a}
                        className="rounded-full border border-black/10 px-2.5 py-1 text-[11px] text-body dark:border-white/15"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex items-center gap-2 border-t border-black/10 bg-white/95 px-5 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0f1520]/95 sm:px-7">
              <a
                href="tel:+919989778222"
                className="flex-1 rounded-full border border-black/15 px-4 py-3 text-center text-[12.5px] font-semibold text-ink transition-colors hover:border-navy dark:border-white/20 dark:text-white"
              >
                Call
              </a>
              <Link
                to="/properties/$slug"
                params={{ slug: property.slug }}
                onClick={onClose}
                className="flex-[1.4] rounded-full bg-[#1E3A5F] px-4 py-3 text-center text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                See full details →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
