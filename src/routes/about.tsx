import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Preloader, ScrollProgress, SiteFooter, SiteHeader, useDarkMode } from "@/components/SiteChrome";
import { Reveal, WordReveal, useLenis } from "@/components/motion";
import { InnerPageHero } from "@/components/InnerPageHero";
import { useTeamMembers } from "@/lib/queries";
import { pageMeta, ldScript, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => {
    const seo = pageMeta({
      title: "About Us | Trusted Real Estate Developers in Kakinada",
      description:
        "15+ years building Kakinada — Swamy Reality Developers craft RERA & KAUDA approved plots, apartments and gated communities across Andhra Pradesh.",
      path: "/about",
    });
    return {
      ...seo,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ),
      ],
    };
  },
  component: AboutPage,
});

function CountUp({ to, suffix = "", duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{n}{suffix}</span>;
}

function AboutPage() {
  const { dark, toggle } = useDarkMode();
  useLenis();

  const differentiators = [
    { n: "01", t: "Client-Centric Approach", d: "Every decision — from layout to material choice — starts from the family who will live there. Transparent pricing, clear titles, no surprises." },
    { n: "02", t: "Quality Construction", d: "We work with vetted contractors, source materials directly, and inspect at every stage. Homes built to outlast trends." },
    { n: "03", t: "Innovative Design", d: "Layouts that respect the plot, the sun, the street. Contemporary lines with the warmth of a home meant to be lived in for decades." },
  ];

  const services = [
    { t: "Architecture", d: "End-to-end architectural design tailored to your plot, family and budget." },
    { t: "Exterior Design", d: "Facades that age gracefully — considered proportions, honest materials." },
    { t: "Landscape Design", d: "Gardens, courtyards and pocket parks that soften and connect the built form." },
    { t: "Site Planning", d: "Master-planned communities with clear circulation, utilities and public space." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader />
      <ScrollProgress />
      <SiteHeader dark={dark} toggle={toggle} />

      <InnerPageHero
        image="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=2400&q=80"
        eyebrow="Who We Are"
        title="Building Kakinada's Future"
        subtitle="A family-run practice designing, approving and delivering homes across Kakinada for over fifteen years."
        crumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
      />


      {/* Quick Facts — GEO / AI-extraction block */}
      <section className="mx-auto max-w-[1280px] px-6 pb-20 lg:px-10 lg:pb-24">
        <div className="rounded-2xl border border-black/10 bg-white/60 p-8 dark:border-white/10 dark:bg-white/[0.03] lg:p-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="eyebrow">Quick Facts</div>
              <h2 className="mt-4 font-display text-[26px] leading-[1.15] text-ink dark:text-white lg:text-[34px]">
                Swamy Reality Developers at a glance
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.75] text-body">
                Swamy Reality Developers is a family-run real estate company in Kakinada, Andhra Pradesh, building RERA, KAUDA and DTCP approved plots, apartments and gated communities across the region.
              </p>
            </div>
            <div className="lg:col-span-7">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-[14px] leading-[1.6] sm:grid-cols-2">
                {[
                  ["Company", "Swamy Reality Developers"],
                  ["Founded", "15+ years of operation"],
                  ["Headquarters", "Kakinada, Andhra Pradesh, India"],
                  ["Business type", "Real estate developer (residential)"],
                  ["Active projects", "6 developments across Kakinada"],
                  ["Approvals", "RERA, KAUDA, DTCP"],
                  ["Specialities", "Plots, apartments, gated communities, custom construction"],
                  ["Contact", "+91 99897 78222"],
                ].map(([k, v]) => (
                  <div key={k} className="border-b border-black/5 pb-3 dark:border-white/10">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy dark:text-white/70">{k}</dt>
                    <dd className="mt-1 text-ink dark:text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>


      {/* Story */}
      <section className="mx-auto max-w-[1280px] px-6 pb-20 lg:px-10 lg:pb-[120px]">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div className="eyebrow">Our Story</div>
            <h2 className="mt-5 font-display text-[32px] leading-[1.15] text-ink lg:text-[46px]">
              <WordReveal text="Quietly shaping Kakinada's neighbourhoods for over 15 years." />
            </h2>
            <div className="mt-8 space-y-5 text-[15px] leading-[1.75] text-body">
              <p>Swamy Reality Developers began as a small family practice with a simple belief — that a home should be honest, unhurried and made to last. Three generations later, that belief still runs through everything we build.</p>
              <p>From our first plot layout on the outskirts of Kakinada to fully planned gated communities today, we've grown carefully. Every project is walked by a family member before it opens. Every buyer meets someone whose name is on the door.</p>
              <p>We work in Kakinada because we know Kakinada — its streets, its soil, its rhythms. It's not a market to us. It's home.</p>
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <Reveal className="relative">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80" alt="Kakinada residence" className="h-full w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.15} className="absolute -bottom-8 -left-8 hidden w-[55%] md:block">
              <div className="relative aspect-[4/3] overflow-hidden border-8 border-background">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" alt="Community view" className="h-full w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.3} className="absolute -right-4 top-8 hidden bg-ink-navy px-7 py-6 text-white shadow-xl md:block">
              <div className="font-display text-[44px] leading-none">15+</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/60">Years<br/>of Trust</div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-[1280px] px-6 pb-20 lg:px-10 lg:pb-[120px]">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {[
            { n: "01", t: "Our Mission", d: "To deliver homes and communities in Kakinada that families are proud to own — with clear titles, honest craftsmanship and design that respects both the plot and the people." },
            { n: "02", t: "Our Vision", d: "To be the name Kakinada thinks of first when it thinks of home — synonymous with trust, quiet quality, and neighbourhoods that grow better with time." },
          ].map((c) => (
            <Reveal key={c.n}>
              <div className="relative border border-black/10 p-10 dark:border-white/10 lg:p-14">
                <div className="font-display text-[80px] leading-none text-navy/15 dark:text-white/15 lg:text-[120px]">{c.n}</div>
                <h3 className="mt-6 font-display text-[28px] text-ink lg:text-[36px]">{c.t}</h3>
                <p className="mt-5 max-w-md text-[15px] leading-[1.75] text-body">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What Makes Us Different — scroll timeline */}
      <TimelineSection
        eyebrow="The Difference"
        title="What Makes Us Different"
        items={differentiators}
      />

      {/* Sustainability */}
      <section className="relative overflow-hidden bg-ink-navy text-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[560px]">
            <img src="https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=1600&q=80" alt="Sustainable construction" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink-navy/40 lg:to-ink-navy" />
          </div>
          <div className="px-6 py-16 lg:px-16 lg:py-24">
            <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/50">Sustainability</div>
            <h2 className="mt-5 font-display text-[32px] leading-[1.15] lg:text-[48px]">
              <WordReveal text="Our Commitment to Sustainability" />
            </h2>
            <div className="mt-8 space-y-5 text-[15px] leading-[1.8] text-white/75">
              <p>We build with the next generation in mind. Every project uses locally sourced, low-embodied-carbon materials where possible, and passive design principles — cross-ventilation, shaded facades, and daylighting — to reduce operational load year-round.</p>
              <p>Our sites cut construction waste through modular planning, and we pursue green certifications on all new gated communities. Energy-efficient fixtures, rainwater harvesting and native landscaping are standard, not premiums.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — compact */}
      <section className="relative overflow-hidden bg-ink-navy py-14 sm:py-16 lg:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="relative mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8">
            {[
              { n: 200, s: "+", l: "Happy Families" },
              { n: 6, s: "", l: "Projects Delivered" },
              { n: 4, s: "", l: "Ongoing" },
              { n: 100, s: "%", l: "Satisfaction" },
            ].map((it, i) => (
              <motion.div
                key={it.l}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="text-center sm:text-left"
              >
                <div className="font-display text-[32px] leading-none text-white sm:text-[42px] lg:text-[54px]">
                  <CountUp to={it.n} suffix={it.s} />
                </div>
                <div className="mt-2.5 text-[10px] uppercase tracking-[0.2em] text-white/55 sm:text-[11px]">{it.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services — scroll timeline */}
      <TimelineSection
        eyebrow="What We Do"
        title="Our Services"
        items={services.map((s, i) => ({ n: `0${i + 1}`, t: s.t, d: s.d }))}
      />

      <TeamSection />


      {/* CTA */}
      <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden bg-ink-navy px-6 py-16 text-center text-white lg:px-16 lg:py-24"
        >
          <div className="eyebrow text-white/60">Get In Touch</div>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-[32px] leading-[1.15] lg:text-[52px]">
            We Provide the Best Service in the Industry
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.75] text-white/70">
            Reach us via a quick call, a WhatsApp message, or the contact form — whichever feels easiest.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="tel:+919989778222" style={{ backgroundColor: "#ffffff", color: "#1E3A5F" }} className="rounded-full px-7 py-3.5 text-[13px] font-semibold hover:opacity-90">Call Now</a>
            <a href="https://wa.me/919989778222" style={{ backgroundColor: "#25D366", color: "#ffffff" }} className="rounded-full px-7 py-3.5 text-[13px] font-semibold hover:opacity-90">WhatsApp</a>
            <a href="/#contact" className="rounded-full border border-white/40 px-7 py-3.5 text-[13px] font-semibold text-white hover:bg-white/10">Contact Form</a>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}

function TimelineSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: { n: string; t: string; d: string }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-[120px]">
      <div className="mb-14 max-w-3xl">
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="mt-5 font-display text-[36px] leading-[1.1] text-ink lg:text-[52px]">
          <WordReveal text={title} />
        </h2>
      </div>

      <div ref={containerRef} className="relative">
        {/* Timeline spine */}
        <div className="absolute left-4 top-0 h-full w-px bg-black/10 dark:bg-white/10 lg:left-1/2 lg:-translate-x-1/2" />
        <motion.div
          style={{ height: progressHeight }}
          className="absolute left-4 top-0 w-px bg-navy dark:bg-white lg:left-1/2 lg:-translate-x-1/2"
        />

        <div className="space-y-14 lg:space-y-24">
          {items.map((it, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div
                key={it.n + it.t}
                className="relative grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-16"
              >
                {/* Node dot */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-4 top-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-navy ring-4 ring-background dark:bg-white lg:left-1/2"
                />

                <motion.div
                  initial={{ opacity: 0, y: 30, x: isLeft ? -20 : 20 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className={`pl-12 lg:pl-0 ${isLeft ? "lg:col-start-1 lg:pr-16 lg:text-right" : "lg:col-start-2 lg:pl-16"}`}
                >
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-navy dark:text-[#7fa8d6]">
                    {it.n}
                  </div>
                  <h3 className="mt-4 font-display text-[24px] leading-tight text-ink lg:text-[30px]">
                    {it.t}
                  </h3>
                  <p className="mt-4 text-[14px] leading-[1.75] text-body lg:text-[15px]">{it.d}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const { data } = useTeamMembers();
  const members = data || [];
  // Demo fallback so the section never appears empty before admin content lands
  const fallback = [
    { id: "f1", name: "Swamy Rao", role: "Founder & CEO", bio: "Three decades in Kakinada real estate. Every project is walked personally before it opens.", photo: { url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80", publicId: "", alt: "Founder portrait" }, isFounder: true, displayOrder: 0, isActive: true },
    { id: "f2", name: "Ananya Sharma", role: "Head of Design", bio: "Leads architecture and interior direction across all developments.", photo: { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", publicId: "", alt: "Head of Design portrait" }, displayOrder: 1, isActive: true },
    { id: "f3", name: "Rohit Verma", role: "Head of Construction", bio: "Ensures every site is built to spec — no shortcuts, no surprises.", photo: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", publicId: "", alt: "Head of Construction portrait" }, displayOrder: 2, isActive: true },
  ];
  const list = members.length > 0 ? members : fallback;
  const founder = list.find((m) => m.isFounder) || list[0];
  const rest = list.filter((m) => m.id !== founder?.id);

  return (
    <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
      <div className="mb-14 max-w-2xl">
        <div className="eyebrow">Our People</div>
        <h2 className="mt-5 font-display text-[36px] leading-[1.1] text-ink lg:text-[52px]">
          <WordReveal text="The team behind every home." />
        </h2>
        <p className="mt-5 text-[15px] leading-[1.75] text-body">
          A family-run practice with specialists across design, construction and client care.
        </p>
      </div>

      {founder && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-20 overflow-hidden"
        >
          {/* Decorative frame */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            <div className="absolute -left-6 -top-6 h-24 w-24 border-l-2 border-t-2 border-[#C9A96E]" />
            <div className="absolute -bottom-6 -right-6 h-24 w-24 border-b-2 border-r-2 border-[#C9A96E]" />
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-ink-navy text-white shadow-2xl ring-1 ring-white/10">
            {/* Ambient gold glow */}
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-[#C9A96E]/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-[#7fa8d6]/15 blur-3xl" />
            {/* Subtle grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />

            <div className="relative grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
              {/* Portrait */}
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[560px]">
                  {founder.photo?.url ? (
                    <motion.img
                      initial={{ scale: 1.08 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                      src={founder.photo.url}
                      alt={founder.photo.alt || founder.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center font-display text-7xl text-white/30">
                      {founder.name.charAt(0)}
                    </div>
                  )}
                  {/* Gradient wash on the seam */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-navy/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-ink-navy/40" />
                  {/* Corner badge */}
                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E]" />
                    Est. 2010
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C9A96E]">
                  <span className="h-px w-8 bg-[#C9A96E]" />
                  Founder &amp; CEO
                </div>

                <h3 className="mt-6 font-display text-[36px] leading-[1.05] text-white sm:text-[46px] lg:text-[58px]">
                  {founder.name}
                </h3>

                {/* Signature-style script line */}
                <div className="mt-3 font-display italic text-[18px] text-white/60 sm:text-[20px]">
                  — {founder.role || "Founder & Chief Executive"}
                </div>

                <div className="mt-8 h-px w-16 bg-white/25" />

                {founder.bio && (
                  <p className="mt-8 max-w-xl text-[15px] leading-[1.85] text-white/80 sm:text-[16px]">
                    {founder.bio}
                  </p>
                )}

                {/* Quick stats */}
                <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:gap-8">
                  {[
                    { n: "15+", l: "Years" },
                    { n: "200+", l: "Families" },
                    { n: "10+", l: "Projects" },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="font-display text-[24px] leading-none text-white sm:text-[30px]">
                        {s.n}
                      </div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}


      {rest.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {rest.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
                {m.photo?.url ? (
                  <img src={m.photo.url} alt={m.photo.alt || m.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full w-full place-items-center font-display text-5xl text-body/40">{m.name.charAt(0)}</div>
                )}
              </div>
              <div className="p-6">
                <h4 className="font-display text-[22px] leading-tight text-ink dark:text-white">{m.name}</h4>
                <div className="mt-1.5 text-[12px] uppercase tracking-[0.16em] text-navy dark:text-[#7fa8d6]">{m.role}</div>
                {m.bio && <p className="mt-4 text-[14px] leading-[1.7] text-body">{m.bio}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

