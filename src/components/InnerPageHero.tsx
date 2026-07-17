import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type Crumb = { label: string; to?: string };

export function InnerPageHero({
  image,
  eyebrow,
  title,
  subtitle,
  crumbs,
  children,
}: {
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  crumbs: Crumb[];
  children?: ReactNode;
}) {
  const words = title.split(/\s+/);
  return (
    <section
      className="relative w-full overflow-hidden mb-16 lg:mb-24"
      style={{ height: "min(55vh, 720px)" }}
    >
      <div className="absolute inset-0 h-[45vh] md:h-[55vh] lg:h-[55vh]" aria-hidden />
      {/* Background image + Ken Burns */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
        />
      </motion.div>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,21,35,0.30) 0%, rgba(11,21,35,0.55) 55%, rgba(11,21,35,0.78) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1280px] flex-col justify-end px-6 pb-12 pt-28 lg:px-10 lg:pb-16 lg:pt-32">
        <motion.nav
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          aria-label="Breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-2 text-[12px] text-white/70"
        >
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-2">
              {c.to ? (
                <Link to={c.to} className="hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white/85">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span className="text-[#7fa8d6]/70">/</span>}
            </span>
          ))}
        </motion.nav>

        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7fa8d6]"
          >
            {eyebrow}
          </motion.div>
        )}

        <h1 className="font-display text-[34px] leading-[1.05] text-white md:text-[46px] lg:text-[56px]">
          {words.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mr-[0.25em] inline-block"
            >
              {w}
            </motion.span>
          ))}
        </h1>

        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + words.length * 0.05 }}
            className="mt-5 max-w-2xl text-[14px] leading-[1.7] text-white/75 lg:text-[16px]"
          >
            {subtitle}
          </motion.div>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
