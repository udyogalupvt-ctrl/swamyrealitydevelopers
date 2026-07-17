import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Card, GhostButton, PrimaryButton, Skeleton } from "@/components/admin/AdminShell";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Fragment, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EnquiryDoc } from "@/lib/firestore/types";
import { deleteEnquiry, updateEnquiry } from "@/lib/firestore/mutations";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/enquiries")({ component: EnquiriesAdmin });

type Row = EnquiryDoc & { id: string };
const STATUSES = ["all", "new", "contacted", "closed"] as const;

function EnquiriesAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (s) => { setRows(s.docs.map((d) => ({ id: d.id, ...(d.data() as EnquiryDoc) }))); setLoading(false); },
      (e) => { setError(e.message); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!r.name?.toLowerCase().includes(s) && !r.mobile?.includes(search)) return false;
      }
      const t = r.createdAt?.toMillis?.() ?? 0;
      if (from && t && t < new Date(from).getTime()) return false;
      if (to && t && t > new Date(to).getTime() + 86400000) return false;
      return true;
    });
  }, [rows, status, search, from, to]);

  const setStatusFor = async (id: string, next: EnquiryDoc["status"]) => {
    try { await updateEnquiry(id, { status: next }); toast.success(`Marked as ${next}`); }
    catch (e) { toast.error((e as Error).message); }
  };
  const del = async (id: string) => {
    try { await deleteEnquiry(id); toast.success("Enquiry deleted"); }
    catch (e) { toast.error((e as Error).message); }
  };

  const exportCsv = () => {
    const headers = ["Name", "Mobile", "Email", "Message", "Source", "Property", "Status", "Date"];
    const rows2 = filtered.map((r) => [
      r.name, r.mobile, r.email, (r.message || "").replace(/\n/g, " "), r.sourcePage, r.propertyId || "", r.status,
      r.createdAt?.toDate?.().toISOString() || "",
    ]);
    const csv = [headers, ...rows2].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const waLink = (r: Row) =>
    `https://wa.me/91${r.mobile.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${r.name}, thanks for your enquiry with Swamy Reality Developers. We'd love to help you further.`)}`;

  return (
    <AdminShell
      title="Enquiries"
      breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Enquiries" }]}
      action={<GhostButton onClick={exportCsv}>Export CSV</GhostButton>}
    >
      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] dark:border-slate-700 dark:bg-slate-950">
          {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
        </select>
        <input placeholder="Search name or mobile" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[180px] rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] dark:border-slate-700 dark:bg-slate-950" />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] dark:border-slate-700 dark:bg-slate-950" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] dark:border-slate-700 dark:bg-slate-950" />
        <span className="text-[12px] text-slate-500">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </Card>

      {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">Firestore error: {error}</div>}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-slate-500">No enquiries match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-950/50">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Mobile</th>
                  <th className="px-4 py-2.5 hidden md:table-cell">Email</th>
                  <th className="px-4 py-2.5 hidden lg:table-cell">Source</th>
                  <th className="px-4 py-2.5 hidden md:table-cell">Date</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <Fragment key={r.id}>
                    <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-2.5">
                        <button className="text-left font-medium hover:underline" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>{r.name}</button>
                        {r.propertyId && <div className="text-[11px] text-slate-500">→ {r.propertyId}</div>}
                      </td>
                      <td className="px-4 py-2.5">{r.mobile}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-slate-500">{r.email}</td>
                      <td className="px-4 py-2.5 hidden lg:table-cell text-slate-500">{r.sourcePage}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-slate-500">{r.createdAt?.toDate?.().toLocaleDateString?.() || "—"}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill s={r.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap justify-end gap-1">
                          {r.status !== "contacted" && <button className="rounded border border-slate-200 px-2 py-1 text-[11px] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setStatusFor(r.id, "contacted")}>Mark contacted</button>}
                          {r.status !== "closed" && <button className="rounded border border-slate-200 px-2 py-1 text-[11px] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setStatusFor(r.id, "closed")}>Close</button>}
                          <a href={`tel:${r.mobile}`} className="rounded bg-slate-900 px-2 py-1 text-[11px] font-medium text-white dark:bg-slate-100 dark:text-slate-900">Call</a>
                          <a href={waLink(r)} target="_blank" rel="noreferrer" className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700">WhatsApp</a>
                          <button onClick={() => setConfirmDel(r.id)} className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50">Delete</button>
                        </div>
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr key={r.id + "-msg"} className="border-t border-slate-100 dark:border-slate-800">
                        <td colSpan={7} className="bg-slate-50 px-4 py-3 text-[12px] text-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
                          <span className="font-medium">Message:</span> {r.message || <em className="text-slate-400">—</em>}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete enquiry?"
        message="This will permanently remove this enquiry from Firestore."
        confirmLabel="Delete"
        danger
        onConfirm={() => confirmDel && del(confirmDel)}
        onClose={() => setConfirmDel(null)}
      />
    </AdminShell>
  );
}

function StatusPill({ s }: { s: EnquiryDoc["status"] }) {
  const cls =
    s === "new" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      : s === "contacted" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{s}</span>;
}
