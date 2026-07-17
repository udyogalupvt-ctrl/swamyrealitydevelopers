import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Card, GhostButton, PrimaryButton, Skeleton } from "@/components/admin/AdminShell";
import { ConfirmDialog, useUnsavedGuard } from "@/components/admin/ConfirmDialog";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllFaqs } from "@/lib/firestore/admin-queries";
import { createFaq, deleteFaq, updateFaq } from "@/lib/firestore/mutations";
import type { FaqDoc } from "@/lib/firestore/types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/admin/faqs")({ component: FaqsAdmin });

const CATEGORIES = ["General", "Buying", "Legal", "Financing", "Investment"];

type FormState = {
  id?: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  showOnHomepage: boolean;
  isActive: boolean;
};
const empty = (order = 0): FormState => ({
  question: "", answer: "", category: "General", displayOrder: order,
  showOnHomepage: false, isActive: true,
});

function FaqsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "faqs"], queryFn: listAllFaqs });
  const [editing, setEditing] = useState<FormState | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "faqs"] }); qc.invalidateQueries({ queryKey: ["faqs"] }); };

  const grouped = useMemo(() => {
    const g: Record<string, FaqDoc[]> = {};
    (data || []).forEach((f) => { (g[f.category || "General"] ||= []).push(f); });
    Object.values(g).forEach((arr) => arr.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
    return g;
  }, [data]);

  return (
    <AdminShell
      title="FAQs"
      breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "FAQs" }]}
      action={<PrimaryButton onClick={() => setEditing(empty((data?.length ?? 0)))}>+ Add FAQ</PrimaryButton>}
    >
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="p-10 text-center text-[13px] text-slate-500">No FAQs yet.</Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <FaqGroup
              key={cat}
              category={cat}
              items={items}
              onEdit={(f) => setEditing({ ...f })}
              onDelete={(id) => setConfirmDel(id)}
              onReorder={async (next) => {
                try {
                  await Promise.all(next.map((it, i) => it.displayOrder === i ? null : updateFaq(it.id, { displayOrder: i })));
                  toast.success("Order saved");
                  refresh();
                } catch (e) { toast.error((e as Error).message); }
              }}
              onToggle={async (id, patch) => {
                try { await updateFaq(id, patch); toast.success("Saved"); refresh(); }
                catch (e) { toast.error((e as Error).message); }
              }}
            />
          ))}
        </div>
      )}

      {editing && (
        <FaqEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete FAQ?"
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (!confirmDel) return;
          try { await deleteFaq(confirmDel); toast.success("Deleted"); refresh(); }
          catch (e) { toast.error((e as Error).message); }
        }}
        onClose={() => setConfirmDel(null)}
      />
    </AdminShell>
  );
}

function FaqGroup({ category, items, onEdit, onDelete, onReorder, onToggle }: {
  category: string;
  items: FaqDoc[];
  onEdit: (f: FaqDoc) => void;
  onDelete: (id: string) => void;
  onReorder: (next: FaqDoc[]) => void;
  onToggle: (id: string, patch: Partial<FaqDoc>) => void;
}) {
  const [local, setLocal] = useState(items);
  useMemo(() => setLocal(items), [items]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = local.findIndex((v) => v.id === active.id);
    const newIndex = local.findIndex((v) => v.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(local, oldIndex, newIndex);
    setLocal(next); onReorder(next);
  };
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-display text-[15px] font-semibold text-slate-900 dark:text-slate-100">{category}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">{items.length}</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={local.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {local.map((f) => (
              <FaqRow key={f.id} f={f} onEdit={() => onEdit(f)} onDelete={() => onDelete(f.id)} onToggle={onToggle} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function FaqRow({ f, onEdit, onDelete, onToggle }: { f: FaqDoc; onEdit: () => void; onDelete: () => void; onToggle: (id: string, patch: Partial<FaqDoc>) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: f.id });
  return (
    <div
      ref={setNodeRef as unknown as React.Ref<HTMLDivElement>}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      <Card className="flex items-center gap-3 p-3">
        <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600" title="Drag">⋮⋮</button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-slate-900 dark:text-slate-100">{f.question}</div>
          <div className="mt-0.5 line-clamp-1 text-[11px] text-slate-500" dangerouslySetInnerHTML={{ __html: f.answer }} />
        </div>
        <label className="hidden items-center gap-1 text-[11px] text-slate-600 sm:flex dark:text-slate-300">
          <input type="checkbox" checked={f.showOnHomepage} onChange={(e) => onToggle(f.id, { showOnHomepage: e.target.checked })} /> Home
        </label>
        <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={f.isActive} onChange={(e) => onToggle(f.id, { isActive: e.target.checked })} /> Active
        </label>
        <GhostButton onClick={onEdit}>Edit</GhostButton>
        <button onClick={onDelete} className="rounded-md border border-red-200 px-2 py-1 text-[12px] text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50">Delete</button>
      </Card>
    </div>
  );
}

function FaqEditor({ initial, onClose, onSaved }: { initial: FormState; onClose: () => void; onSaved: () => void }) {
  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(state) !== JSON.stringify(initial);
  useUnsavedGuard(dirty);
  const closeGuarded = () => { if (dirty && !confirm("Discard unsaved changes?")) return; onClose(); };

  const save = async () => {
    if (!state.question.trim()) { toast.error("Question is required"); return; }
    setSaving(true);
    try {
      const payload = {
        question: state.question,
        answer: state.answer,
        category: state.category,
        displayOrder: state.displayOrder,
        showOnHomepage: state.showOnHomepage,
        isActive: state.isActive,
      };
      if (state.id) { await updateFaq(state.id, payload); toast.success("FAQ updated"); }
      else { await createFaq(payload); toast.success("FAQ created"); }
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={closeGuarded}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{state.id ? "Edit FAQ" : "New FAQ"}</h3>
          <button onClick={closeGuarded} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="space-y-4">
          <Field label="Question">
            <input value={state.question} onChange={(e) => setState({ ...state, question: e.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
          </Field>
          <Field label="Answer">
            <RichTextEditor value={state.answer} onChange={(html) => setState({ ...state, answer: html })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select value={state.category} onChange={(e) => setState({ ...state, category: e.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Display order">
              <input type="number" value={state.displayOrder} onChange={(e) => setState({ ...state, displayOrder: Number(e.target.value) })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] dark:border-slate-700 dark:bg-slate-950" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4 text-[13px]">
            <label className="flex items-center gap-2"><input type="checkbox" checked={state.showOnHomepage} onChange={(e) => setState({ ...state, showOnHomepage: e.target.checked })} /> Show on homepage</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={state.isActive} onChange={(e) => setState({ ...state, isActive: e.target.checked })} /> Active</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <GhostButton onClick={closeGuarded}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>{saving ? "Saving…" : state.id ? "Save changes" : "Create FAQ"}</PrimaryButton>
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
