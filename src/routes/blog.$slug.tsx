import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { SiteFooter, SiteHeader, useDarkMode, BackButton } from "@/components/SiteChrome";
import { useLenis, Reveal } from "@/components/motion";
import { getPost, type Post } from "@/lib/blog";
import { usePostBySlug, usePostsList } from "@/lib/data-adapters";
import { pageMeta, ldScript, breadcrumbLd, articleLd } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    return { post: post ?? null };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    const slug = params?.slug || "";
    if (!p) {
      return pageMeta({
        title: "Real Estate Article | Swamy Reality Developers Blog",
        description: "Read Kakinada real estate buying guides, legal explainers and market insights from Swamy Reality Developers.",
        path: `/blog/${slug}`,
      });
    }
    const seo = pageMeta({
      title: `${p.title} | Swamy Reality Developers Blog`.slice(0, 60),
      description: p.excerpt.slice(0, 155),
      path: `/blog/${p.slug}`,
      image: p.image,
      type: "article",
    });
    return {
      ...seo,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: p.title, path: `/blog/${p.slug}` },
          ]),
        ),
        ldScript(
          articleLd({
            title: p.title,
            excerpt: p.excerpt,
            image: p.image,
            slug: p.slug,
            author: (p as { author?: string }).author,
            date: (p as { date?: string; publishedAt?: string }).date || (p as { publishedAt?: string }).publishedAt,
          }),
        ),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="font-display text-4xl text-ink">Article not found</div>
        <Link to="/blog" className="mt-4 inline-block text-navy underline">Back to blog</Link>
      </div>
    </div>
  ),
  component: BlogDetail,
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function BlogDetail() {
  const params = Route.useParams();
  const slug = params.slug || (typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean).at(-1) : "");
  const staticPost = slug ? getPost(slug) : undefined;
  const { data: livePost, html: liveHtml, loading: postLoading } = usePostBySlug(slug);
  const { data: posts } = usePostsList();
  const post: Post | null | undefined = postLoading ? undefined : (livePost ?? staticPost);
  const { dark, toggle } = useDarkMode();
  useLenis();

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const hasRichHtml = !!liveHtml?.trim();
  const toc = useMemo<{ id: string; text: string }[]>(
    () =>
      post && !hasRichHtml
        ? post.content
            .filter((b: Post["content"][number]) => b.type === "h2")
            .map((b: Post["content"][number]) => ({ id: slugify(b.text!), text: b.text! }))
        : [],
    [post, hasRichHtml]
  );
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      if (!articleRef.current) return;
      const rect = articleRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(1, Math.max(0, -rect.top / total));
      setProgress(scrolled);
      const els = toc.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
      let current = toc[0]?.id ?? "";
      for (const el of els) {
        if (el.getBoundingClientRect().top < 140) current = el.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  if (!post && postLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader dark={dark} toggle={toggle} />
        <div className="flex min-h-screen items-center justify-center px-6 text-center">
          <div>
            <div className="eyebrow">Blog</div>
            <div className="mt-3 font-display text-4xl text-ink dark:text-white">Opening article…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="font-display text-4xl text-ink">Article not found</div>
          <Link to="/blog" className="mt-4 inline-block text-navy underline">Back to blog</Link>
        </div>
      </div>
    );
  }

  const currentIdx = posts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIdx > 0 ? posts[currentIdx - 1] : null;
  const nextPost = currentIdx >= 0 && currentIdx < posts.length - 1 ? posts[currentIdx + 1] : null;
  const related = posts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const relatedFilled = related.length >= 3 ? related : [...related, ...posts.filter((p) => p.slug !== post.slug && !related.includes(p))].slice(0, 3);

  const share = (target: "wa" | "fb" | "x" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(post.title);
    const u = encodeURIComponent(url);
    if (target === "wa") window.open(`https://wa.me/?text=${text}%20${u}`, "_blank");
    if (target === "fb") window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank");
    if (target === "x") window.open(`https://twitter.com/intent/tweet?text=${text}&url=${u}`, "_blank");
    if (target === "copy") {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Reading progress bar */}
      <div className="fixed left-0 top-0 z-[60] h-[2px] w-full">
        <div className="h-full bg-[#1E3A5F] transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>

      <SiteHeader dark={dark} toggle={toggle} />

      {/* Back nav */}
      <div className="mx-auto max-w-[1200px] px-6 pt-24 lg:px-10 lg:pt-28">
        <BackButton to="/blog" label="Back to Blog" />
      </div>

      {/* Hero */}
      <HeroParallax post={post} />




      {/* Body */}
      <section className="relative">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 lg:grid-cols-[80px_minmax(0,1fr)_240px] lg:gap-10 lg:px-10 lg:py-24">
          {/* Sticky share */}
          <div className="hidden lg:block">
            <div className="sticky top-32 flex flex-col items-center gap-3">
              <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-body/60">Share</div>
              {[
                { id: "wa", label: "WA" },
                { id: "fb", label: "FB" },
                { id: "x", label: "X" },
                { id: "copy", label: "⧉" },
              ].map((s) => (
                <button key={s.id} onClick={() => share(s.id as any)} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-[11px] font-semibold text-ink hover:border-navy hover:text-navy dark:border-white/20 dark:text-white dark:hover:border-white">
                  {s.label}
                </button>
              ))}
              <AnimatePresence>
                {copied && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 rounded-full bg-ink-navy px-3 py-1 text-[10px] font-semibold text-white">
                    Copied
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Article */}
          <article ref={articleRef} className="max-w-[720px]">
            <div className="space-y-6 text-[18px] leading-[1.8] text-ink/85 dark:text-white/85 [font-family:Archivo,sans-serif]">
              {hasRichHtml ? (
                <Reveal y={16}>
                  <div className="blog-rich-content" dangerouslySetInnerHTML={{ __html: liveHtml! }} />
                </Reveal>
              ) : (
                post.content.map((b: Post["content"][number], i: number) => {
                  let node: React.ReactNode = null;
                  if (b.type === "h2") {
                    const id = slugify(b.text!);
                    node = <h2 id={id} className="scroll-mt-32 pt-6 font-display text-[30px] leading-[1.2] text-ink dark:text-white lg:text-[36px]">{b.text}</h2>;
                  } else if (b.type === "h3") {
                    node = <h3 className="pt-2 font-display text-[22px] text-ink dark:text-white lg:text-[26px]">{b.text}</h3>;
                  } else if (b.type === "p") {
                    node = <p>{b.text}</p>;
                  } else if (b.type === "quote") {
                    node = (
                      <blockquote className="border-l-4 border-navy pl-6 font-display text-[22px] italic leading-[1.4] text-ink dark:text-white lg:text-[26px]">
                        “{b.text}”
                      </blockquote>
                    );
                  } else if (b.type === "ul") {
                    node = (
                      <ul className="space-y-3 pl-1">
                        {b.items!.map((it: string, j: number) => (
                          <li key={j} className="relative pl-6 before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-navy">{it}</li>
                        ))}
                      </ul>
                    );
                  } else if (b.type === "img") {
                    node = (
                      <figure className="my-4 overflow-hidden">
                        <motion.img
                          src={b.src}
                          alt={b.caption ?? ""}
                          className="w-full"
                          initial={{ scale: 1.08, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                        />
                        {b.caption && <figcaption className="mt-3 text-[13px] text-body/70">{b.caption}</figcaption>}
                      </figure>
                    );
                  }
                  if (!node) return null;
                  return <Reveal key={i} y={16}>{node}</Reveal>;
                })
              )}


              {/* Mid CTA */}
              <Reveal>
                <div className="my-10 border border-black/10 bg-warm-gray/40 p-8 dark:border-white/10 dark:bg-white/5">
                  <div className="eyebrow">Ready when you are</div>
                  <h3 className="mt-3 font-display text-[22px] text-ink dark:text-white lg:text-[26px]">Book a free site visit with Swamy Reality Developers.</h3>
                  <p className="mt-3 text-[14px] leading-[1.7] text-body">Walk any of our sites, meet the family, ask anything. No pressure.</p>
                  <Link to="/contact" style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }} className="mt-6 inline-flex rounded-full px-6 py-3 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 hover:opacity-90">Book Free Site Visit</Link>
                </div>
              </Reveal>
            </div>

            {/* End CTA */}
            <Reveal>
              <div className="mt-14 border border-black/10 bg-ink-navy p-10 text-white dark:border-white/10">
                <h3 className="font-display text-[26px] leading-[1.2] lg:text-[32px]">Talk to us about your next home.</h3>
                <p className="mt-3 max-w-md text-[14px] leading-[1.7] text-white/70">We build only in Kakinada, and we take our time. A single call is enough to know if we're the right fit.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="tel:+919989778222" style={{ backgroundColor: "#ffffff", color: "#1E3A5F" }} className="rounded-full px-6 py-3 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 hover:opacity-90">Call Now</a>
                  <Link to="/contact" className="rounded-full border border-white/40 px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/10">Contact</Link>
                </div>
              </div>
            </Reveal>


            {/* Prev / Next */}
            <div className="mt-14 grid gap-4 border-t border-black/10 pt-10 dark:border-white/10 sm:grid-cols-2">
              {prevPost ? (
                <Link to="/blog/$slug" params={{ slug: prevPost.slug }} className="group block border border-black/10 p-6 hover:border-navy dark:border-white/10 dark:hover:border-white/30">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-body/60">← Previous</div>
                  <div className="mt-2 font-display text-[18px] text-ink dark:text-white">{prevPost.title}</div>
                </Link>
              ) : <div />}
              {nextPost && (
                <Link to="/blog/$slug" params={{ slug: nextPost.slug }} className="group block border border-black/10 p-6 text-right hover:border-navy dark:border-white/10 dark:hover:border-white/30">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-body/60">Next →</div>
                  <div className="mt-2 font-display text-[18px] text-ink dark:text-white">{nextPost.title}</div>
                </Link>
              )}
            </div>
          </article>

          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 border-l border-black/10 pl-5 dark:border-white/10">
              <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-body/60">On this page</div>
              <ul className="space-y-3 text-[13px]">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className={`block transition-colors ${activeId === t.id ? "text-navy font-semibold dark:text-white" : "text-body hover:text-ink dark:hover:text-white"}`}>
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-[28px] text-ink dark:text-white lg:text-[40px]">Related Articles</h2>
          <Link to="/blog" className="text-[12px] font-semibold uppercase tracking-[0.2em] text-navy dark:text-white">All Posts →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {relatedFilled.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block h-full border border-black/10 transition-all hover:-translate-y-1 hover:border-navy dark:border-white/10 dark:hover:border-white/30">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img src={p.image} alt={p.imageAlt || p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                  <div className="absolute left-4 top-4 bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">{p.category}</div>
                </div>
                <div className="p-6">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-body/70">{p.date}</div>
                  <h3 className="mt-3 font-display text-[19px] leading-[1.25] text-ink dark:text-white">{p.title}</h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function HeroParallax({ post }: { post: Post }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const titleWords = post.title.split(" ");
  return (
    <section ref={ref} className="relative">
      <div className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
        <motion.img
          src={post.image}
          alt={post.imageAlt || post.title}
          style={{ y, scale }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-navy/95 via-ink-navy/60 to-ink-navy/10" />
        <motion.div style={{ opacity }} className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-[1080px] px-6 pb-14 lg:px-10 lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white"
            >
              <span className="bg-white/15 px-3 py-1 backdrop-blur">{post.category}</span>
            </motion.div>
            <h1 className="max-w-4xl font-display text-[36px] leading-[1.05] text-white lg:text-[64px]">
              {titleWords.map((w, i) => (
                <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
                  <motion.span
                    style={{ display: "inline-block" }}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.06 }}
                  >
                    {w}
                  </motion.span>
                  {i < titleWords.length - 1 && "\u00A0"}
                </span>
              ))}
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 + titleWords.length * 0.06 }}
              className="mt-6 flex flex-wrap items-center gap-4 text-[12px] uppercase tracking-[0.2em] text-white/75"
            >
              <span>{post.author}</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>{post.date}</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>{post.readTime}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

