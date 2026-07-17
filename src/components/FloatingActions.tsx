import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FloatingActions
 * - Desktop (>= 1024px): shows floating WhatsApp bubble bottom-right.
 * - Mobile / tablet (< 1024px): shows sticky bottom Call + WhatsApp bar. NO floating bubble.
 * - Both fade/slide out when the user reaches the footer CTA (bottom of the page)
 *   so they never cover the CTA buttons.
 */
export function FloatingActions() {
  const [past, setPast] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setPast(y > vh * 0.6);
      // "Footer CTA in view" proxy: within ~640px of the bottom of the document.
      const doc = document.documentElement;
      const remaining = doc.scrollHeight - (y + vh);
      setAtBottom(remaining < 640);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  const stickyVisible = past && !atBottom;
  const waMessage = encodeURIComponent(
    "Hello Swamy Reality Developers, I'm interested in learning more about your properties in Kakinada. Could you please share the details?",
  );
  const waHref = `https://wa.me/919989778222?text=${waMessage}`;

  return (
    <>
      {/* Floating WhatsApp bubble — desktop only */}
      <AnimatePresence>
        {!atBottom && (
          <motion.a
            key="fab"
            href={waHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 right-8 z-40 hidden h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-110 lg:flex"
            style={{ backgroundColor: "#22c55e" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 3.5A11.9 11.9 0 0 0 3 20l-1 4 4.1-1.1A12 12 0 1 0 20.5 3.5zM12 21.4a9.4 9.4 0 0 1-4.8-1.3l-.3-.2-2.4.6.7-2.3-.2-.4A9.4 9.4 0 1 1 12 21.4zm5.4-7c-.3-.2-1.7-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a7.7 7.7 0 0 1-2.3-1.4 8.5 8.5 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.6-.7-1.7-1-2.3-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6c0 1.5 1.1 3 1.3 3.2s2.2 3.4 5.4 4.8a17.6 17.6 0 0 0 1.8.7 4.3 4.3 0 0 0 2 .1 3.2 3.2 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z" />
            </svg>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Mobile sticky bottom bar */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-[55] grid grid-cols-2 gap-2 border-t border-black/10 bg-white p-3 lg:hidden dark:border-white/10 dark:bg-[#0f1520]"
          >
            <a
              href="tel:+919989778222"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold text-white"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>
              Call Now
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold text-white"
              style={{ backgroundColor: "#22c55e" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.9 11.9 0 0 0 3 20l-1 4 4.1-1.1A12 12 0 1 0 20.5 3.5zM12 21.4a9.4 9.4 0 0 1-4.8-1.3l-.3-.2-2.4.6.7-2.3-.2-.4A9.4 9.4 0 1 1 12 21.4zm5.4-7c-.3-.2-1.7-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a7.7 7.7 0 0 1-2.3-1.4 8.5 8.5 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.6-.7-1.7-1-2.3-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6c0 1.5 1.1 3 1.3 3.2s2.2 3.4 5.4 4.8a17.6 17.6 0 0 0 1.8.7 4.3 4.3 0 0 0 2 .1 3.2 3.2 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z"/></svg>
              WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
