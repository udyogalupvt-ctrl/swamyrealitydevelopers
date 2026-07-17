import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Card, GhostButton, PrimaryButton, Skeleton } from "@/components/admin/AdminShell";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllTestimonials } from "@/lib/firestore/admin-queries";
import { createTestimonial, deleteTestimonial, updateTestimonial } from "@/lib/firestore/mutations";
import type { TestimonialDoc, CloudinaryImage } from "@/lib/firestore/types";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/testimonials")({ component: TestimonialsAdmin });

type FormState = {
  id?: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar?: CloudinaryImage;
  displayOrder: number;
  isActive: boolean;
};
const empty = (order = 0): FormState => ({
  name: "", role: "", quote: "", rating: 5, displayOrder: order, isActive: true,
});

function TestimonialsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "testimonials"], queryFn: listAllTestimonials });
  const [editing, setEditing] = useState<FormState | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    qc.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const rows = data || [];

  return (
    <AdminShell
      title="Testimonials"
      breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Testimonials" }]}
      action={<PrimaryButton onClick={() => setEditing(empty(rows.length))}>+ Add testimonial</PrimaryButton>}
    >
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-[13px] text-slate-500">
          No testimonials yet. Add your first client story to feature on the homepage carousel.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-center gap-3">
                {t.avatar?.url ? (
                  <img src={t.avatar.url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 font-display text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{t.name}</div>
                  {t.role && <div className="truncate text-[11px] text-slate-500">{t.role}</div>}
                </div>
                <div className="text-[11px] text-amber-500">{"★".repeat(t.rating || 5)}</div>
              </div>
              <p className="mt-3 line-clamp-3 text-[13px] text-slate-600 dark:text-slate-300">{t.quote}</p>
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                <span>Order {t.displayOrder} · {t.isActive ? "Active" : "Hidden"}</span>
                <div className="flex gap-1.5">
                  <GhostButton onClick={() => setEditing({
                    id: t.id, name: t.name, role: t.role || "", quote: t.quote,
                    rating: t.rating || 5, avatar: t.avatar, displayOrder: t.displayOrder,
                    isActive: t.isActive,
                  })}>Edit</GhostButton>
                  <button onClick={() => setConfirmDel(t.id)} className="rounded-md border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50">Delete</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <Editor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete testimonial?"
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (!confirmDel) return;
          try { await deleteTestimonial(confirmDel); toast.success("Deleted"); refresh(); }
          catch (e) { toast.error((e as Error).message); }
        }}
        onClose={() => setConfirmDel(null)}
      />
    </AdminShell>
  );
}

function Editor({ initial, onClose, onSaved }: { initial: FormState; onClose: () => void; onSaved: () => void }) {
  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!state.name.trim()) { toast.error("Name is required"); return; }
    if (!state.quote.trim()) { toast.error("Quote is required"); return; }
    setSaving(true);
    try {
      const payload: Omit<TestimonialDoc, "id" | "createdAt" | "updatedAt"> = {
        name: state.name.trim(),
        role: state.role.trim() || undefined,
        quote: state.quote.trim(),
        rating: Math.max(1, Math.min(5, Number(state.rating) || 5)),
        avatar: state.avatar,
        displayOrder: Number(state.displayOrder) || 0,
        isActive: state.isActive,
      };
      if (state.id) { await updateTestimonial(state.id, payload); toast.success("Updated"); }
      else { await createTestimonial(payload); toast.success("Created"); }
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{state.id ? "Edit testimonial" : "New testimonial"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="space-y-4">
          <Field label="Client name">
            <input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
          </Field>
          <Field label="Role / location (optional)">
            <input value={state.role} onChange={(e) => setState({ ...state, role: e.target.value })} placeholder="Homeowner · Ramanayapeta" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
          </Field>
          <Field label="Quote">
            <textarea value={state.quote} onChange={(e) => setState({ ...state, quote: e.target.value })} rows={5} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
          </Field>
          <Field label="Avatar (optional)">
            <ImageUploader
              value={state.avatar ? [state.avatar] : []}
              onChange={(imgs) => setState({ ...state, avatar: imgs[0] })}
              folder="swamy/testimonials"
              multiple={false}
              max={1}
              aspectRatio="1:1"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rating (1–5)">
              <input type="number" min={1} max={5} value={state.rating} onChange={(e) => setState({ ...state, rating: Number(e.target.value) })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
            </Field>
            <Field label="Display order">
              <input type="number" value={state.displayOrder} onChange={(e) => setState({ ...state, displayOrder: Number(e.target.value) })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={state.isActive} onChange={(e) => setState({ ...state, isActive: e.target.checked })} /> Active (show on site)
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>{saving ? "Saving…" : state.id ? "Save changes" : "Create"}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-300">{label}</div>
      {children}
    </label>
  );
}
