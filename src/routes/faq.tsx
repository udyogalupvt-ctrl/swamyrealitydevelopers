import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Preloader, ScrollProgress, SiteFooter, SiteHeader, useDarkMode } from "@/components/SiteChrome";
import { WordReveal, useLenis } from "@/components/motion";
import { InnerPageHero } from "@/components/InnerPageHero";
import { useFaqGroups } from "@/lib/data-adapters";
import { FAQ_GROUPS } from "@/lib/faqs";
import { pageMeta, ldScript, breadcrumbLd, faqLd } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => {
    const seo = pageMeta({
      title: "Real Estate FAQs — Buying Property in Kakinada | Swamy Reality",
      description:
        "Answers about buying plots, apartments and gated communities in Kakinada — RERA, KAUDA, DTCP approvals, home loans and registration.",
      path: "/faq",
    });
    const items = FAQ_GROUPS.flatMap((g) => g.items as ReadonlyArray<{ q: string; a: string }>).map((it) => ({ q: it.q, a: it.a }));
    return {
      ...seo,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ),
        ldScript(faqLd(items)),
      ],
    };
  },
  component: FAQPage,
});

function FAQPage() {
  const { dark, toggle } = useDarkMode();
  useLenis();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const { data: groups } = useFaqGroups();

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => (it.q + " " + it.a).toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [query, groups]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader />
      <ScrollProgress />
      <SiteHeader dark={dark} toggle={toggle} />

      <InnerPageHero
        image="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2400&q=80"
        eyebrow="Support"
        title="Frequently Asked Questions"
        subtitle="Everything about buying plots, apartments and gated communities in Kakinada — RERA, KAUDA, DTCP, loans and registration."
        crumbs={[{ label: "Home", to: "/" }, { label: "FAQ" }]}
      />

      <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          {/* Sidebar */}
          <aside>
            <div className="sticky top-32 space-y-8">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions…"
                className="w-full rounded-full border border-black/15 bg-transparent px-5 py-3 text-[13px] text-ink outline-none transition-colors focus:border-navy dark:border-white/20 dark:text-white dark:focus:border-white"
              />
              <div className="hidden lg:block">
                <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-body/60">Categories</div>
                <ul className="space-y-3 text-[13px]">
                  {groups.map((g) => (
                    <li key={g.id}>
                      <a href={`#${g.id}`} className="block text-body transition-colors hover:text-navy dark:hover:text-white">
                        {g.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>


          {/* Groups */}
          <div className="space-y-16">
            {filteredGroups.length === 0 && (
              <div className="py-14 text-center text-body">No questions match — try a different word.</div>
            )}
            {filteredGroups.map((g, gi) => (
              <motion.div
                key={g.id}
                id={g.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.6, delay: gi * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-32"
              >
                <div className="mb-8 flex items-baseline gap-4">
                  <span className="font-display text-[36px] leading-none text-navy/20 dark:text-white/20 lg:text-[48px]">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-[28px] text-ink dark:text-white lg:text-[36px]">{g.title}</h2>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-body/60">{g.items.length} questions</span>
                </div>
                <div className="border-t border-black/10 dark:border-white/10">
                  {g.items.map((it, i) => {
                    const id = `${g.id}-${i}`;
                    const isOpen = open === id;
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                        transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        className="border-b border-black/10 dark:border-white/10"
                      >
                        <button
                          onClick={() => setOpen(isOpen ? null : id)}
                          className={`group flex w-full items-center justify-between gap-6 py-6 text-left transition-colors ${isOpen ? "text-navy dark:text-white" : ""}`}
                        >
                          <span className="font-display text-[18px] text-ink dark:text-white lg:text-[20px]">{it.q}</span>
                          <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? "rotate-45 border-navy bg-navy text-white dark:border-white dark:bg-white dark:text-[#101418]" : "border-black/15 text-ink group-hover:border-navy dark:border-white/20 dark:text-white"}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pb-6 pr-10 text-[15px] leading-[1.75] text-body">{it.a}</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="border border-black/10 p-10 text-center dark:border-white/10 lg:p-16">
          <div className="eyebrow">Still Have Questions?</div>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-[28px] leading-[1.2] text-ink dark:text-white lg:text-[40px]">Talk to someone from the family — we're always happy to help.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="tel:+919989778222" style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }} className="rounded-full px-7 py-3.5 text-[13px] font-semibold hover:opacity-90">Call +91 99897 78222</a>
            <a href="https://wa.me/919989778222" style={{ backgroundColor: "#25D366", color: "#ffffff" }} className="rounded-full px-7 py-3.5 text-[13px] font-semibold hover:opacity-90">WhatsApp</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
