import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Property } from "../lib/properties";

type Props = {
  items: Property[];
  onView?: (p: Property) => void;
};

// A 3D coverflow-style carousel with drag / swipe support.
// Center card is prominent; adjacent cards recede with rotateY + scale.
export function ProjectsCoverflow({ items, onView }: Props) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (count === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/15 p-6 text-center text-[13px] text-body dark:border-white/15">
        No properties match the current filters.
      </div>
    );
  }

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative mx-auto h-[360px] w-full select-none"
        style={{ perspective: "1200px" }}
      >
        <AnimatePresence initial={false}>
          {items.map((p, i) => {
            // shortest signed offset in circular list
            let offset = i - index;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;
            const abs = Math.abs(offset);
            if (abs > 2) return null;

            const x = offset * 62; // % of container
            const rotateY = offset * -22;
            const scale = 1 - abs * 0.12;
            const z = -abs * 120;
            const opacity = abs > 1 ? 0.35 : 1;

            return (
              <motion.div
                key={p.slug}
                className="absolute left-1/2 top-1/2 w-[78%] max-w-[320px]"
                style={{ transformStyle: "preserve-3d", zIndex: 10 - abs }}
                initial={false}
                animate={{
                  x: `calc(-50% + ${x}%)`,
                  y: "-50%",
                  rotateY,
                  scale,
                  z,
                  opacity,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 28 }}
                drag={offset === 0 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                onClick={() => {
                  if (offset === 0) onView?.(p);
                  else setIndex(i);
                }}
              >
                <div className="group relative overflow-hidden rounded-2xl bg-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]">
                  <div className="relative aspect-[4/5]">
                    <img
                      src={p.images[0]}
                      alt={p.imageAlts?.[0] || p.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1E3A5F]">
                      {p.type}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h4 className="font-display text-[20px] leading-tight text-white">{p.name}</h4>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/80">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span className="truncate">{p.location}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10.5px] font-mono text-white/70">{p.approvals.rera}</span>
                        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white">
                          Tap to view →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-4 mb-8 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous project"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink transition-colors hover:border-[#1E3A5F] hover:text-navy dark:border-white/15 dark:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to project ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#1E3A5F] dark:bg-white" : "w-1.5 bg-black/20 dark:bg-white/25"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next project"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink transition-colors hover:border-[#1E3A5F] hover:text-navy dark:border-white/15 dark:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>
    </div>
  );
}
