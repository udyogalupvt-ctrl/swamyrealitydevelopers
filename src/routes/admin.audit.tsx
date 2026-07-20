import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AuditLogDoc } from "@/lib/firestore/audit";
import { AdminShell, Card } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/audit")({ component: AuditPage });

type EntityFilter = "all" | "property" | "blogPost" | "galleryImage" | "heroConfig";
type ActionFilter = "all" | "create" | "update" | "delete";

const ENTITY_LABEL: Record<Exclude<EntityFilter, "all">, string> = {
  property: "Property",
  blogPost: "Blog post",
  galleryImage: "Gallery image",
  heroConfig: "Hero config",
};

const ACTION_STYLES: Record<Exclude<ActionFilter, "all">, string> = {
  create: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  update: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  delete: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

function fmt(ts?: Timestamp) {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function AuditPage() {
  const [logs, setLogs] = useState<AuditLogDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState<EntityFilter>("all");
  const [action, setAction] = useState<ActionFilter>("all");
  const [max, setMax] = useState(200);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(max));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as AuditLogDoc));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [max]);

  const filtered = useMemo(() => {
    return logs.filter(
      (l) => (entity === "all" || l.entity === entity) && (action === "all" || l.action === action)
    );
  }, [logs, entity, action]);

  return (
    <AdminShell title="Audit log" breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Audit log" }]}>
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Entity</label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value as EntityFilter)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[13px] dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="all">All</option>
            <option value="property">Properties</option>
            <option value="blogPost">Blog posts</option>
            <option value="galleryImage">Gallery</option>
          </select>
          <label className="ml-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as ActionFilter)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[13px] dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="all">All</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <div className="ml-auto text-[12px] text-slate-500">
            {loading ? "Loading…" : `${filtered.length} of ${logs.length} shown`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium">Entity</th>
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No audit entries yet. Create, edit, or delete a property, blog post, or gallery item to see it here.
                  </td>
                </tr>
              )}
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(l.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ACTION_STYLES[l.action]}`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{ENTITY_LABEL[l.entity] ?? l.entity}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{l.label || "(untitled)"}</div>
                    <div className="text-[11px] text-slate-500">{l.entityId}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {l.actorEmail || l.actorUid || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 p-3 dark:border-slate-800">
          <span className="text-[12px] text-slate-500">Showing latest {max}</span>
          <button
            onClick={() => setMax((m) => m + 200)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Load more
          </button>
        </div>
      </Card>
    </AdminShell>
  );
}
