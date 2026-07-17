import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ScrollProgress, SiteFooter, SiteHeader, useDarkMode } from "@/components/SiteChrome";
import { Reveal, useLenis } from "@/components/motion";
import { InnerPageHero } from "@/components/InnerPageHero";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { usePostsList } from "@/lib/data-adapters";
import { pageMeta, ldScript, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const seo = pageMeta({
      title: "Kakinada Real Estate Blog | Buying Guides & Market Insights",
      description:
        "Kakinada real estate insights — buying guides, market trends and investment advice from Swamy Reality Developers.",
      path: "/blog",
    });
    return {
      ...seo,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ),
      ],
    };
  },
  component: BlogPage,
});

const PAGE = 6;

function BlogPage() {
  const { dark, toggle } = useDarkMode();
  useLenis();
  const [cat, setCat] = useState<(typeof BLOG_CATEGORIES)[number]>("All");
  const [visible, setVisible] = useState(PAGE);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { data: posts } = usePostsList();

  const featured = posts[0];
  const rest = posts.slice(1);
  const filtered = useMemo(
    () => (cat === "All" ? rest : rest.filter((p) => p.category === cat)),
    [cat, rest]
  );
  const shown = filtered.slice(0, visible);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <SiteHeader dark={dark} toggle={toggle} />

      <InnerPageHero
        image="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2400&q=80"
        eyebrow="Insights"
        title="Kakinada Real Estate Blog"
        subtitle="Market insights, buying guides, legal walkthroughs and investment advice — written for buyers, not brochures."
        crumbs={[{ label: "Home", to: "/" }, { label: "Blog" }]}
      />

      <div className="sticky top-16 z-30 border-y border-black/5 bg-background/85 backdrop-blur dark:border-white/10 lg:top-20">
        <div className="mx-auto flex max-w-[1280px] gap-2 overflow-x-auto px-6 py-4 lg:px-10">
          {BLOG_CATEGORIES.map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                onClick={() => { setCat(c); setVisible(PAGE); }}
                className={`whitespace-nowrap rounded-full border px-5 py-2 text-[12px] font-medium transition-colors ${
                  active
                    ? "border-transparent bg-ink-navy text-white dark:bg-white dark:text-[#101418]"
                    : "border-black/10 text-body hover:border-navy hover:text-ink dark:border-white/15 dark:hover:border-white/40 dark:hover:text-white"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {featured && (
        <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">
          <Reveal>
            <Link to="/blog/$slug" params={{ slug: featured.slug }} className="group block border border-black/10 transition-colors hover:border-navy dark:border-white/10 dark:hover:border-white/30">
              <div className="grid lg:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto">
                  <img src={featured.image} alt={featured.imageAlt || featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                  <div className="absolute left-5 top-5 bg-ink-navy px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">Featured</div>
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-14">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-navy">{featured.category}</div>
                  <h2 className="mt-4 font-display text-[28px] leading-[1.15] text-ink lg:text-[42px]">{featured.title}</h2>
                  <p className="mt-5 text-[15px] leading-[1.75] text-body">{featured.excerpt}</p>
                  <div className="mt-8 flex items-center gap-4 text-[12px] uppercase tracking-[0.18em] text-body/70">
                    <span>{featured.date}</span>
                    <span className="h-1 w-1 rounded-full bg-body/40" />
                    <span>{featured.readTime}</span>
                  </div>
                  <div className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-navy">
                    Read Article
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">
        <LayoutGroup>
          <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <motion.div
                  layout
                  key={p.slug}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (i % PAGE) * 0.05 }}
                >
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block h-full border border-black/10 transition-all hover:-translate-y-1 hover:border-navy dark:border-white/10 dark:hover:border-white/30">
                    <div className="relative aspect-[16/11] overflow-hidden">
                      <img src={p.image} alt={p.imageAlt || p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                      <div className="absolute left-4 top-4 bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#101418]">{p.category}</div>
                    </div>
                    <div className="p-6 lg:p-7">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-body/70">{p.date} · {p.readTime}</div>
                      <h3 className="mt-3 font-display text-[20px] leading-[1.25] text-ink lg:text-[22px]">{p.title}</h3>
                      <p className="mt-3 line-clamp-2 text-[14px] leading-[1.65] text-body">{p.excerpt}</p>
                      <div className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold text-navy">
                        Read more <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
        {visible < filtered.length && (
          <div className="mt-14 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE)}
              className="group inline-flex items-center gap-3 rounded-full border border-ink/20 px-8 py-3.5 text-[13px] font-semibold text-ink hover:border-navy hover:text-navy dark:border-white/25 dark:text-white dark:hover:border-white"
            >
              Load More <span className="transition-transform group-hover:translate-y-0.5">↓</span>
            </button>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="relative overflow-hidden bg-ink-navy px-6 py-14 text-white lg:px-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">Newsletter</div>
              <h2 className="mt-4 font-display text-[28px] leading-[1.2] lg:text-[38px]">Get Kakinada real-estate insights, monthly.</h2>
              <p className="mt-4 max-w-md text-[14px] leading-[1.75] text-white/70">No spam, no listings — just genuinely useful market notes and buyer guides.</p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-[14px] text-white placeholder-white/40 outline-none focus:border-white/60"
              />
              <button
                type="submit"
                disabled={subscribed}
                style={{ backgroundColor: "#ffffff", color: "#1E3A5F" }}
                className="rounded-full px-7 py-3.5 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {subscribed ? "✓ Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>
          <AnimatePresence>
            {subscribed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-[13px] text-white/70"
              >
                Thanks — you're on the list. First issue lands next week.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}