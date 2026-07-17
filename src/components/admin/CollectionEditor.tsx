import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "url" | "select" | "list";
  options?: readonly string[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
};

export type Row = Record<string, unknown>;

type Props = {
  title: string;
  rows: Row[];
  loading: boolean;
  fields: Field[];
  columns: { key: string; label: string; render?: (r: Row) => React.ReactNode }[];
  onCreate: (data: Row) => Promise<void>;
  onUpdate: (id: string, data: Row) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  emptyData?: Row;
  invalidateKeys?: unknown[][];
};

export function CollectionEditor({ title, rows, loading, fields, columns, onCreate, onUpdate, onDelete, emptyData, invalidateKeys }: Props) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNew = () => setEditing({ ...(emptyData || {}) });
  const cancel = () => { setEditing(null); setError(null); };

  const invalidate = () => {
    for (const k of invalidateKeys || []) qc.invalidateQueries({ queryKey: k });
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      const id = editing.id as string | undefined;
      const data = { ...editing };
      delete data.id;
      if (id) await onUpdate(id, data);
      else await onCreate(data);
      invalidate();
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    setBusy(true);
    try {
      await onDelete(id);
      invalidate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <button onClick={startNew} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">+ New</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-6 text-[13px] text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-[13px] text-slate-500">No records yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-950/50">
              <tr>
                {columns.map((c) => <th key={c.key} className="px-4 py-2.5">{c.label}</th>)}
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)} className="border-t border-slate-100 dark:border-slate-800">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-2.5">{c.render ? c.render(r) : String(r[c.key] ?? "")}</td>
                  ))}
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => setEditing({ ...r })} className="mr-2 text-[12px] font-semibold text-slate-900 hover:underline dark:text-white">Edit</button>
                    <button onClick={() => remove(String(r.id))} disabled={busy} className="text-[12px] font-semibold text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={cancel}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 font-display text-lg font-semibold">{editing.id ? "Edit" : "New"} record</div>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-[12px] font-medium text-slate-600 dark:text-slate-300">{f.label}</label>
                  {f.hint && <div className="text-[11px] text-slate-400">{f.hint}</div>}
                  {f.type === "textarea" ? (
                    <textarea
                      value={String(editing[f.key] ?? "")}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      rows={5}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  ) : f.type === "checkbox" ? (
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={!!editing[f.key]}
                        onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })}
                      />
                    </div>
                  ) : f.type === "number" ? (
                    <input
                      type="number"
                      value={Number(editing[f.key] ?? 0)}
                      onChange={(e) => setEditing({ ...editing, [f.key]: Number(e.target.value) })}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={String(editing[f.key] ?? "")}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === "list" ? (
                    <textarea
                      value={Array.isArray(editing[f.key]) ? (editing[f.key] as string[]).join("\n") : ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                      rows={4}
                      placeholder={f.placeholder || "One item per line"}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  ) : (
                    <input
                      type={f.type === "url" ? "url" : "text"}
                      value={String(editing[f.key] ?? "")}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>
            {error && <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:bg-red-950/60 dark:text-red-300">{error}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={cancel} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700">Cancel</button>
              <button onClick={save} disabled={busy} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900">{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
