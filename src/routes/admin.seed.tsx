import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { seedProperties, seedPosts, seedFaqs, seedHero, seedAdmin } from "@/lib/seed";
import { useAuth } from "@/lib/auth-context";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/seed")({
  component: SeedPage,
});

function SeedPage() {
  const { user } = useAuth();
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ label: string; done: number; total: number } | null>(null);

  const [selProps, setSelProps] = useState(true);
  const [selPosts, setSelPosts] = useState(true);
  const [selFaqs, setSelFaqs] = useState(true);
  const [selHero, setSelHero] = useState(true);

  const append = (s: string) => setLog((l) => [...l, s]);

  const runSeed = async () => {
    if (!selProps && !selPosts && !selFaqs && !selHero) {
      append("✗ Please select at least one collection to seed.");
      return;
    }
    setBusy(true);
    setLog([]);
    try {
      append("Seeding started…");
      const prog = (label: string, done: number, total: number) => setProgress({ label, done, total });
      if (selProps) await seedProperties(prog);
      if (selPosts) await seedPosts(prog);
      if (selFaqs) await seedFaqs(prog);
      if (selHero) await seedHero(prog);
      append("✓ Selected collections seeded successfully.");
    } catch (e) {
      append(`✗ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const registerSelfAsAdmin = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await seedAdmin(user.uid, user.email || "", user.displayName || "Admin");
      append(`✓ Registered ${user.email} as admin.`);
    } catch (e) {
      append(`✗ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Seed content" breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Seed" }]}>
      <p className="max-w-2xl text-[13px] text-slate-500">
        Select which collections you want to populate with the static fallback content. Safe to re-run — writes are idempotent (upsert by slug/ID).
      </p>

      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={selProps} onChange={(e) => setSelProps(e.target.checked)} disabled={busy} className="h-4 w-4 rounded border-slate-300 text-slate-900" />
          Properties
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={selPosts} onChange={(e) => setSelPosts(e.target.checked)} disabled={busy} className="h-4 w-4 rounded border-slate-300 text-slate-900" />
          Blog Posts
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={selFaqs} onChange={(e) => setSelFaqs(e.target.checked)} disabled={busy} className="h-4 w-4 rounded border-slate-300 text-slate-900" />
          FAQs
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={selHero} onChange={(e) => setSelHero(e.target.checked)} disabled={busy} className="h-4 w-4 rounded border-slate-300 text-slate-900" />
          Hero Slides
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={runSeed}
          disabled={busy}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          {busy ? "Working…" : "Seed selected"}
        </button>
        <button
          onClick={registerSelfAsAdmin}
          disabled={busy || !user}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
        >
          Register me as admin
        </button>
      </div>

      {progress && (
        <div className="mt-6 max-w-md">
          <div className="mb-1 flex justify-between text-[12px] text-slate-500">
            <span className="capitalize">{progress.label}</span>
            <span>{progress.done}/{progress.total}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full bg-slate-900 transition-all dark:bg-white" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-900 p-5 font-mono text-[12px] leading-relaxed text-green-300">
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
