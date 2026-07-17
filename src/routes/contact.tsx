import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Preloader, ScrollProgress, SiteFooter, SiteHeader, useDarkMode } from "@/components/SiteChrome";
import { WordReveal, Reveal, useLenis } from "@/components/motion";
import { InnerPageHero } from "@/components/InnerPageHero";
import { pageMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { createEnquiry } from "@/lib/firestore/mutations";

export const Route = createFileRoute("/contact")({
  head: () => {
    const seo = pageMeta({
      title: "Contact Swamy Reality Developers | Real Estate in Kakinada",
      description:
        "Talk to Swamy Reality Developers in Kakinada — call, WhatsApp or email us for RERA & KAUDA approved plots, apartments and gated communities.",
      path: "/contact",
    });
    return {
      ...seo,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ),
      ],
    };
  },
  component: ContactPage,
});

type FormState = { name: string; email: string; mobile: string; message: string };

function Field({
  label, value, onChange, type = "text", error, textarea, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
  error?: string; textarea?: boolean; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const commonCls = `peer w-full border-b bg-transparent pb-3 pt-6 text-[15px] text-ink outline-none transition-colors dark:text-white ${
    error ? "border-red-500" : "border-black/20 focus:border-navy dark:border-white/20 dark:focus:border-white"
  }`;
  return (
    <div className="relative">
      {textarea ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${commonCls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={commonCls}
        />
      )}
      <label
        className={`pointer-events-none absolute left-0 text-body transition-all duration-200 ${
          active ? "top-0 text-[11px] uppercase tracking-[0.22em] text-navy dark:text-white" : "top-6 text-[14px]"
        }`}
      >
        {label}
      </label>
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-[12px] text-red-500">
          {error}
        </motion.div>
      )}
    </div>
  );
}

function ContactPage() {
  const { dark, toggle } = useDarkMode();
  useLenis();
  const [f, setF] = useState<FormState>({ name: "", email: "", mobile: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!f.name.trim()) e.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email.";
    if (!/^\+?[\d\s-]{10,}$/.test(f.mobile)) e.mobile = "Enter a valid mobile number.";
    if (f.message.trim().length < 10) e.message = "A few more details, please.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await createEnquiry({
        name: f.name.trim(),
        email: f.email.trim(),
        mobile: f.mobile.trim(),
        message: f.message.trim(),
        sourcePage: "contact",
        propertyId: null,
      });
      setDone(true);
    } catch (err) {
      setSubmitError((err as Error)?.message || "Something went wrong. Please call us instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader />
      <ScrollProgress />
      <SiteHeader dark={dark} toggle={toggle} />

      <InnerPageHero
        image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2400&q=80"
        eyebrow="Get In Touch"
        title="Let's Talk About Your Dream Home"
        subtitle="A call, a message, or a walk-in — we're happy either way. Every enquiry is read by someone from the family."
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />


      <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-10 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Form */}
          <Reveal>
            <div className="relative min-w-0 border border-black/10 p-5 dark:border-white/10 sm:p-8 lg:p-12">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-10 text-center"
                  >
                    <motion.svg
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      className="text-navy dark:text-white"
                    >
                      <motion.circle
                        cx="36" cy="36" r="32" fill="none" stroke="currentColor" strokeWidth="2"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: "easeInOut" }}
                      />
                      <motion.path
                        d="M22 37 L32 47 L50 27" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5, ease: "easeInOut" }}
                      />
                    </motion.svg>
                    <div className="mt-6 font-display text-[26px] text-ink dark:text-white">
                      <WordReveal text="Thanks — message received." />
                    </div>
                    <p className="mt-3 max-w-sm text-[14px] leading-[1.7] text-body">Someone from our team will call you back within 24 hours.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0 }}
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
                    }}
                    className="space-y-6"
                  >
                    {[
                      <div key="eb" className="eyebrow">Send a message</div>,
                      <Field key="name" label="Full Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} error={errors.name} autoComplete="name" />,
                      <Field key="email" label="Email" value={f.email} onChange={(v) => setF({ ...f, email: v })} type="email" error={errors.email} autoComplete="email" />,
                      <Field key="mobile" label="Mobile" value={f.mobile} onChange={(v) => setF({ ...f, mobile: v })} type="tel" error={errors.mobile} autoComplete="tel" />,
                      <Field key="msg" label="Your Message" value={f.message} onChange={(v) => setF({ ...f, message: v })} textarea error={errors.message} />,
                      submitError ? (
                        <div key="err" className="rounded-md border border-red-300/70 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                          {submitError}
                        </div>
                      ) : null,
                      <button
                        key="submit"
                        type="submit"
                        disabled={loading}
                        style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
                        className="group inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                          </>
                        )}
                      </button>,
                    ].filter(Boolean).map((child, i) => (
                      <motion.div
                        key={i}
                        variants={{
                          hidden: { opacity: 0, y: 16 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                        }}
                      >
                        {child}
                      </motion.div>
                    ))}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          {/* Info */}
          <div className="min-w-0 space-y-5">
            {[
              { title: "Office", body: "Jawahar St, near Nookalamma Temple,\nRama Rao Peta, Kakinada 533004" },
              { title: "Phone", body: "+91 99897 78222", href: "tel:+919989778222" },
              { title: "Email", body: "sales@swamyrealitydevelopers.com", href: "mailto:sales@swamyrealitydevelopers.com" },
              { title: "Office Hours", body: "Mon – Sat · 9:30 AM to 7:00 PM\nSunday · By appointment" },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="border border-black/10 p-5 dark:border-white/10 sm:p-7">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-navy">{c.title}</div>
                  {c.href ? (
                    <a href={c.href} className="mt-3 block break-words whitespace-pre-line font-display text-[16px] leading-[1.35] text-ink hover:opacity-80 dark:text-white sm:text-[20px]">{c.body}</a>
                  ) : (
                    <div className="mt-3 break-words whitespace-pre-line font-display text-[16px] leading-[1.35] text-ink dark:text-white sm:text-[20px]">{c.body}</div>
                  )}
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.35}>
              <div className="border border-black/10 p-7 dark:border-white/10">
                <div className="text-[10px] uppercase tracking-[0.24em] text-navy">Follow</div>
                <div className="mt-4 flex gap-3">
                  {["FB", "IG", "IN", "YT"].map((s, i) => (
                    <motion.a
                      key={s}
                      href="#"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                      transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -3 }}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15 text-[11px] font-semibold text-ink hover:border-navy hover:text-navy dark:border-white/20 dark:text-white dark:hover:border-white"
                    >
                      {s}
                    </motion.a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Map */}
      <Reveal as="section" className="w-full">
        <iframe
          title="Swamy Reality Developers on map"
          src="https://www.google.com/maps?q=Rama+Rao+Peta,+Kakinada&output=embed"
          className="block h-[420px] w-full grayscale-[15%] lg:h-[520px]"
          loading="lazy"
        />
      </Reveal>


      {/* Mobile sticky */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-black/10 bg-background/95 p-3 backdrop-blur md:hidden dark:border-white/10">
        <a href="tel:+919989778222" style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }} className="flex-1 rounded-full py-3 text-center text-[13px] font-semibold">Call</a>
        <a href="https://wa.me/919989778222" style={{ backgroundColor: "#25D366", color: "#ffffff" }} className="flex-1 rounded-full py-3 text-center text-[13px] font-semibold">WhatsApp</a>
      </div>

      <SiteFooter />
    </div>
  );
}
