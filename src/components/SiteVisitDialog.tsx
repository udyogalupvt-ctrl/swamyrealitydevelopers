import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createEnquiry } from "@/lib/firestore/mutations";

type Props = {
  open: boolean;
  onClose: () => void;
  source?: string;
  propertyId?: string | null;
  propertyName?: string;
  title?: string;
};

type OpenDetail = { source?: string; propertyId?: string | null; propertyName?: string; title?: string };

export function openSiteVisit(detail: OpenDetail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("srd:open-site-visit", { detail }));
}

export function SiteVisitProvider() {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState<OpenDetail>({});
  useEffect(() => {
    const onOpen = (e: Event) => {
      setCfg((e as CustomEvent<OpenDetail>).detail || {});
      setOpen(true);
    };
    window.addEventListener("srd:open-site-visit", onOpen as EventListener);
    return () => window.removeEventListener("srd:open-site-visit", onOpen as EventListener);
  }, []);
  return (
    <SiteVisitDialog
      open={open}
      onClose={() => setOpen(false)}
      source={cfg.source}
      propertyId={cfg.propertyId}
      propertyName={cfg.propertyName}
      title={cfg.title}
    />
  );
}

export function SiteVisitDialog({
  open,
  onClose,
  source = "site-visit",
  propertyId = null,
  propertyName,
  title = "Book a Free Site Visit",
}: Props) {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [failMsg, setFailMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setDone(false);
      setFailMsg(null);
      setErrors({});
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g, "").slice(-10)))
      err.mobile = "Enter a valid 10-digit mobile.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    setFailMsg(null);
    try {
      await createEnquiry({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        message:
          form.message.trim() ||
          (propertyName ? `Site visit request for ${propertyName}.` : "Site visit request."),
        sourcePage: source,
        propertyId: propertyId ?? null,
      });
      setDone(true);
      setForm({ name: "", mobile: "", email: "", message: "" });
    } catch (err) {
      setFailMsg((err as Error)?.message || "Something went wrong. Please try calling us.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-[#141a26] sm:rounded-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-ink hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            {done ? (
              <div className="py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#1E3A5F" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div className="mt-5 font-display text-2xl text-ink dark:text-white">Thanks — we'll be in touch.</div>
                <p className="mt-2 text-[13.5px] leading-[1.7] text-body">
                  Our team will call you within one working day to confirm your site visit.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-full border border-black/15 px-6 py-2.5 text-[12.5px] font-medium text-ink hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-navy">Get In Touch</div>
                <h3 className="mt-2 font-display text-2xl text-ink dark:text-white">{title}</h3>
                {propertyName && (
                  <p className="mt-2 text-[13.5px] text-body">
                    For <span className="font-medium text-ink dark:text-white">{propertyName}</span>
                  </p>
                )}
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <DialogField label="Full Name" value={form.name} error={errors.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <DialogField label="Mobile Number" value={form.mobile} error={errors.mobile} onChange={(v) => setForm({ ...form, mobile: v })} type="tel" />
                  <DialogField label="Email (optional)" value={form.email} error={errors.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                  <DialogField label="Message (optional)" value={form.message} onChange={(v) => setForm({ ...form, message: v })} textarea />
                  {failMsg && (
                    <div className="rounded-md border border-red-300/70 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                      {failMsg}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: "#1E3A5F", color: "#fff" }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Booking…
                      </>
                    ) : (
                      <>Book Site Visit <span>→</span></>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DialogField({
  label, value, onChange, type = "text", textarea, error,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const cls = `peer w-full rounded-lg border bg-transparent px-3.5 pt-5 pb-2 text-[14px] text-ink outline-none transition-colors dark:text-white ${
    error ? "border-red-400" : "border-black/15 focus:border-[#1E3A5F] dark:border-white/20 dark:focus:border-white/60"
  }`;
  return (
    <div className="relative">
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cls}
        />
      )}
      <label
        className={`pointer-events-none absolute left-3.5 transition-all duration-200 ${
          active ? "top-1 text-[10px] uppercase tracking-[0.2em] text-navy dark:text-white/80" : "top-4 text-[13px] text-body"
        }`}
      >
        {label}
      </label>
      {error && <div className="mt-1 text-[11.5px] text-red-500">{error}</div>}
    </div>
  );
}
