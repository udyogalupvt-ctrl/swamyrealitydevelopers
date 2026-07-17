import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Reveal, WordReveal } from "./motion";
import { useHomepageFaqList } from "@/lib/data-adapters";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { data: ITEMS } = useHomepageFaqList();
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-[120px]">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <Reveal>
          <div className="eyebrow">Common Questions</div>
          <h2 className="mt-5 font-display text-[38px] text-ink lg:text-[52px]">
            <WordReveal text="Frequently Asked Questions" />
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-[1.75] text-body">
            Everything buyers usually ask before their first site visit. Still curious? Give us a call — we prefer conversations to contracts.
          </p>
          <a href="#" className="link-underline mt-9 inline-flex text-[13px] font-medium text-ink">
            View All FAQs <span aria-hidden>→</span>
          </a>
        </Reveal>

        <div>
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={it.q} delay={i * 0.06}>
                <div className="border-b border-black/10 dark:border-white/10">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-[19px] text-ink lg:text-[22px]">{it.q}</span>
                    <span
                      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 dark:border-white/20 transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                      aria-hidden
                    >
                      <span className="absolute h-px w-3.5 bg-current" />
                      <span className="absolute h-3.5 w-px bg-current" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="pb-7 pr-12 text-[15px] leading-[1.75] text-body">{it.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
