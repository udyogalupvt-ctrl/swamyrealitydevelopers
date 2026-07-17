import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Card, GhostButton, PrimaryButton, Skeleton } from "@/components/admin/AdminShell";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllTeamMembers } from "@/lib/firestore/admin-queries";
import { createTeamMember, deleteTeamMember, updateTeamMember } from "@/lib/firestore/mutations";
import type { TeamMemberDoc, CloudinaryImage } from "@/lib/firestore/types";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/team")({ component: TeamAdmin });

type FormState = {
  id?: string;
  name: string;
  role: string;
  bio: string;
  photo?: CloudinaryImage;
  isFounder: boolean;
  displayOrder: number;
  isActive: boolean;
};
const empty = (order = 0): FormState => ({
  name: "", role: "", bio: "", isFounder: false, displayOrder: order, isActive: true,
});

function TeamAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "team"], queryFn: listAllTeamMembers });
  const [editing, setEditing] = useState<FormState | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "team"] });
    qc.invalidateQueries({ queryKey: ["teamMembers"] });
  };

  const rows = data || [];

  return (
    <AdminShell
      title="Team"
      breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Team" }]}
      action={<PrimaryButton onClick={() => setEditing(empty(rows.length))}>+ Add member</PrimaryButton>}
    >
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-[13px] text-slate-500">
          No team members yet. Add your Founder &amp; CEO and team to feature on the About page.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-center gap-3">
                {t.photo?.url ? (
                  <img src={t.photo.url} alt={t.photo.alt || t.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200 font-display text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{t.name}</div>
                  <div className="truncate text-[11px] text-slate-500">{t.role}</div>
                </div>
                {t.isFounder && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">Founder</span>}
              </div>
              {t.bio && <p className="mt-3 line-clamp-3 text-[13px] text-slate-600 dark:text-slate-300">{t.bio}</p>}
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                <span>Order {t.displayOrder} · {t.isActive ? "Active" : "Hidden"}</span>
                <div className="flex gap-1.5">
                  <GhostButton onClick={() => setEditing({
                    id: t.id, name: t.name, role: t.role, bio: t.bio || "",
                    photo: t.photo, isFounder: !!t.isFounder,
                    displayOrder: t.displayOrder, isActive: t.isActive,
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
        title="Delete team member?"
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (!confirmDel) return;
          try { await deleteTeamMember(confirmDel); toast.success("Deleted"); refresh(); }
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
    if (!state.role.trim()) { toast.error("Role is required"); return; }
    setSaving(true);
    try {
      const payload: Omit<TeamMemberDoc, "id" | "createdAt" | "updatedAt"> = {
        name: state.name.trim(),
        role: state.role.trim(),
        bio: state.bio.trim() || undefined,
        photo: state.photo,
        isFounder: state.isFounder,
        displayOrder: Number(state.displayOrder) || 0,
        isActive: state.isActive,
      };
      if (state.id) { await updateTeamMember(state.id, payload); toast.success("Updated"); }
      else { await createTeamMember(payload); toast.success("Created"); }
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{state.id ? "Edit member" : "New team member"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="space-y-4">
          <Field label="Name">
            <input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
          </Field>
          <Field label="Role / title">
            <input value={state.role} onChange={(e) => setState({ ...state, role: e.target.value })} placeholder="Founder & CEO" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
          </Field>
          <Field label="Short bio (optional)">
            <textarea value={state.bio} onChange={(e) => setState({ ...state, bio: e.target.value })} rows={4} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
          </Field>
          <Field label="Photo">
            <ImageUploader
              value={state.photo ? [state.photo] : []}
              onChange={(imgs) => setState({ ...state, photo: imgs[0] })}
              folder="swamy/team"
              multiple={false}
              max={1}
              aspectRatio="1:1"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display order">
              <input type="number" value={state.displayOrder} onChange={(e) => setState({ ...state, displayOrder: Number(e.target.value) })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
            </Field>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={state.isFounder} onChange={(e) => setState({ ...state, isFounder: e.target.checked })} /> Founder / CEO
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={state.isActive} onChange={(e) => setState({ ...state, isActive: e.target.checked })} /> Active (show on site)
              </label>
            </div>
          </div>
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
