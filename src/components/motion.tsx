import { motion, useReducedMotion, useInView } from "framer-motion";
import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

/** Reveal: fade + slide up 24px, once, with optional delay */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  as: Tag = "div",
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  as?: any;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const MotionTag = (motion as any)[Tag] || motion.div;
  return (
    <MotionTag
      ref={ref}
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Word-by-word reveal for section headings */
export function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
          <motion.span
            style={{ display: "inline-block", willChange: "transform,opacity" }}
            initial={reduce ? false : { y: "100%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.06 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </span>
  );
}

/** Character-by-character reveal for the hero headline */
export function LettersReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={className} style={{ display: "inline-block" }}>
      {text.split("").map((c, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: "pre", willChange: "transform,opacity" }}
          initial={reduce ? false : { y: 20, opacity: 0 }}
          animate={reduce ? undefined : { y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.03 }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  );
}

/** Magnetic button — follows cursor within radius on desktop */
export function Magnetic({
  children,
  className,
  strength = 0.35,
  as: Tag = "a",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: any;
  [k: string]: any;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      const R = Math.max(r.width, r.height) / 2 + 40;
      if (d < R) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
        });
      } else {
        el.style.transform = "translate(0,0)";
      }
    };
    const onLeave = () => {
      el.style.transition = "transform 0.4s cubic-bezier(0.22,1,0.36,1)";
      el.style.transform = "translate(0,0)";
      setTimeout(() => (el.style.transition = ""), 400);
    };
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength, reduce]);
  return (
    <Tag ref={ref as any} className={className} style={{ display: "inline-flex", willChange: "transform" }} {...rest}>
      {children}
    </Tag>
  );
}

/** Lenis smooth scrolling hook */
export function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lenis: any;
    let raf = 0;
    let cancelled = false;
    (async () => {
      const Lenis = (await import("lenis")).default;
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(2, -10 * t),
      });
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy?.();
    };
  }, []);
}
