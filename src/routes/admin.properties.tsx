import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Card, GhostButton, PrimaryButton, Skeleton } from "@/components/admin/AdminShell";
import { ConfirmDialog, useUnsavedGuard } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllProperties } from "@/lib/firestore/admin-queries";
import { createProperty, deleteProperty, updateProperty } from "@/lib/firestore/mutations";
import type { CloudinaryImage, PropertyDoc } from "@/lib/firestore/types";
import { PROPERTY_TYPE_LABEL } from "@/lib/firestore/types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/admin/properties")({ component: PropertiesAdmin });

const TYPES: PropertyDoc["type"][] = ["apartments", "plots", "gated_community", "premium_plots"];
const STATUSES: PropertyDoc["status"][] = ["ongoing", "completed", "upcoming"];
const APPROVAL_OPTIONS = ["RERA", "KAUDA", "DTCP"];

type Form = Omit<PropertyDoc, "createdAt" | "updatedAt">;

const empty = (order = 0): Form => ({
  id: "",
  slug: "",
  name: "",
  type: "plots",
  location: "",
  shortDescription: "",
  fullDescription: "",
  highlights: [],
  amenities: [],
  approvals: [],
  reraId: "",
  coverImage: { url: "", publicId: "" },
  cardImage: { url: "", publicId: "" },
  youtubeUrls: [],
  galleryImages: [],
  status: "ongoing",
  isFeatured: false,
  isPublished: true,
  displayOrder: order,
  metaTitle: "",
  metaDescription: "",
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function PropertiesAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "properties"], queryFn: listAllProperties });
  const [editing, setEditing] = useState<Form | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [items, setItems] = useState<PropertyDoc[]>([]);
  useMemo(() => { if (data) setItems(data); }, [data]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "properties"] });
    qc.invalidateQueries({ queryKey: ["properties"] });
    qc.invalidateQueries({ queryKey: ["properties", "featured"] });
  };

  const filtered = items.filter((p) => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const patch = async (id: string, p: Partial<PropertyDoc>) => {
    try { await updateProperty(id, p); toast.success("Saved"); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = async (e: DragEndEvent) => {
    if (search || typeFilter !== "all" || statusFilter !== "all") { toast.info("Clear filters to reorder"); return; }
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((v) => v.id === active.id);
    const newIndex = items.findIndex((v) => v.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    try {
      await Promise.all(next.map((it, i) => it.displayOrder === i ? null : updateProperty(it.id, { displayOrder: i })));
      toast.success("Order saved"); refresh();
    } catch (err) { toast.error((err as Error).message); }
  };

  return (
    <AdminShell
      title="Properties"
      breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Properties" }]}
      action={<PrimaryButton onClick={() => setEditing(empty(items.length))}>+ Add Property</PrimaryButton>}
    >
      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[180px] rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] dark:border-slate-700 dark:bg-slate-950" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] dark:border-slate-700 dark:bg-slate-950">
          <option value="all">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] dark:border-slate-700 dark:bg-slate-950">
          <option value="all">All statuses</option>
          {STATUSES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Card>

      {isLoading ? (
        <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-[13px] text-slate-500">No properties match.</Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={filtered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((p) => (
                <Row key={p.id} p={p} onEdit={() => setEditing({ ...(p as unknown as Form) })} onDelete={() => setConfirmDel(p.id)} onPatch={patch} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editing && (
        <PropertyEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
      <ConfirmDialog
        open={!!confirmDel}
        title="Delete property?"
        message="This will permanently remove the property from Firestore. Uploaded images in Cloudinary are not removed."
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (!confirmDel) return;
          try { await deleteProperty(confirmDel); toast.success("Property deleted"); refresh(); }
          catch (e) { toast.error((e as Error).message); }
        }}
        onClose={() => setConfirmDel(null)}
      />
    </AdminShell>
  );
}

function Row({ p, onEdit, onDelete, onPatch }: {
  p: PropertyDoc; onEdit: () => void; onDelete: () => void; onPatch: (id: string, patch: Partial<PropertyDoc>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600" title="Drag">⋮⋮</button>
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
        {p.coverImage?.url && <img src={p.coverImage.url} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-slate-900 dark:text-slate-100">{p.name}</div>
        <div className="truncate text-[11px] text-slate-500">
          {PROPERTY_TYPE_LABEL[p.type] || p.type} • {p.location} • <span className="uppercase">{p.status}</span>
        </div>
      </div>
      <label className="hidden items-center gap-1 text-[11px] text-slate-600 sm:flex dark:text-slate-300" title="Featured">
        <input type="checkbox" checked={!!p.isFeatured} onChange={(e) => onPatch(p.id, { isFeatured: e.target.checked })} /> ★
      </label>
      <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300" title="Published">
        <input type="checkbox" checked={!!p.isPublished} onChange={(e) => onPatch(p.id, { isPublished: e.target.checked })} /> Live
      </label>
      <GhostButton onClick={onEdit}>Edit</GhostButton>
      <button onClick={onDelete} className="rounded-md border border-red-200 px-2 py-1 text-[12px] text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50">Delete</button>
    </div>
  );
}

function PropertyEditor({ initial, onClose, onSaved }: { initial: Form; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Form>(initial);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  useUnsavedGuard(dirty);
  const closeGuarded = () => { if (dirty && !confirm("Discard unsaved changes?")) return; onClose(); };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!f.name.trim() || !f.slug.trim()) { toast.error("Name and slug are required"); return; }
    setSaving(true);
    try {
      const { id, ...payload } = f;
      if (id) { await updateProperty(id, payload); toast.success("Property updated"); }
      else { await createProperty(payload); toast.success("Property created"); }
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={closeGuarded}>
      <div className="my-8 w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{f.id ? "Edit property" : "New property"}</h3>
          <button onClick={closeGuarded} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" required>
              <input value={f.name} onChange={(e) => { const v = e.target.value; set("name", v); if (!slugTouched) set("slug", slugify(v)); }} className={inputCls} />
            </Field>
            <Field label="Slug" required hint="URL segment, auto-generated from name">
              <input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} className={inputCls} />
            </Field>
            <Field label="Type">
              <select value={f.type} onChange={(e) => set("type", e.target.value as PropertyDoc["type"])} className={inputCls}>
                {TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <input value={f.location} onChange={(e) => set("location", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={f.status} onChange={(e) => set("status", e.target.value as PropertyDoc["status"])} className={inputCls}>
                {STATUSES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Display order">
              <input type="number" value={f.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} className={inputCls} />
            </Field>
          </div>

          <Field label="Short description">
            <textarea rows={2} value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Full description" hint="Paragraphs separated by blank lines">
            <textarea rows={6} value={f.fullDescription} onChange={(e) => set("fullDescription", e.target.value)} className={inputCls} />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <ListField label="Highlights" values={f.highlights} onChange={(v) => set("highlights", v)} />
            <ListField label="Amenities" values={f.amenities} onChange={(v) => set("amenities", v)} />
          </div>

          <Field label="Approvals">
            <div className="flex flex-wrap gap-2">
              {APPROVAL_OPTIONS.map((a) => {
                const on = f.approvals.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set("approvals", on ? f.approvals.filter((x) => x !== a) : [...f.approvals, a])}
                    className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${on ? "border-[#1E3A5F] bg-[#1E3A5F] text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}
                  >{a}</button>
                );
              })}
            </div>
          </Field>

          <Field label="RERA ID">
            <input value={f.reraId} onChange={(e) => set("reraId", e.target.value)} className={inputCls} />
          </Field>

          <Field label="Detail page cover image" hint="Wide 16:9 image for the property detail hero section. (Also used as fallback for listing cards)">
            <ImageUploader
              folder="swamy/properties"
              value={f.coverImage?.url ? [f.coverImage] : []}
              onChange={(v) => set("coverImage", v[0] || { url: "", publicId: "" })}
              multiple={false}
              max={1}
              aspectRatio="16:9"
            />
          </Field>

          <Field label="Listing card image (Optional)" hint="Portrait 4:5 image used on the properties listing page. Falls back to cover image if empty.">
            <ImageUploader
              folder="swamy/properties"
              value={f.cardImage?.url ? [f.cardImage] : []}
              onChange={(v) => set("cardImage", v[0] || { url: "", publicId: "" })}
              multiple={false}
              max={1}
              aspectRatio="4:5"
            />
          </Field>

          <Field label="Gallery images">
            <ImageUploader
              folder="swamy/properties"
              value={f.galleryImages || []}
              onChange={(v) => set("galleryImages", v)}
              aspectRatio="4:3"
            />
          </Field>

          <YoutubeUrlsField values={f.youtubeUrls || []} onChange={(v) => set("youtubeUrls", v)} />

          <div className="flex flex-wrap gap-6 text-[13px]">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.isPublished} onChange={(e) => set("isPublished", e.target.checked)} /> Published</label>
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">SEO</div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Meta title" hint={`${(f.metaTitle || "").length}/60`}>
                <input value={f.metaTitle || ""} maxLength={80} onChange={(e) => set("metaTitle", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Meta description" hint={`${(f.metaDescription || "").length}/160`}>
                <input value={f.metaDescription || ""} maxLength={200} onChange={(e) => set("metaDescription", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <GhostButton onClick={closeGuarded}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>{saving ? "Saving…" : f.id ? "Save changes" : "Create property"}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/40 dark:border-slate-700 dark:bg-slate-950";

function Field({ label, children, hint, required }: { label: string; children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{label}{required && <span className="text-red-500"> *</span>}</span>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function ListField({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-300">{label}</div>
      <div className="flex gap-1.5">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { e.preventDefault(); onChange([...values, draft.trim()]); setDraft(""); } }} placeholder={`Add ${label.toLowerCase()}…`} className={inputCls} />
        <GhostButton onClick={() => { if (draft.trim()) { onChange([...values, draft.trim()]); setDraft(""); } }}>Add</GhostButton>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-600">✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Extracts a YouTube video ID from various URL formats. */
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.trim().match(p);
    if (m) return m[1];
  }
  return null;
}

function YoutubeUrlsField({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const add = () => {
    const url = draft.trim();
    if (!url) return;
    const id = extractYoutubeId(url);
    if (!id) {
      setError("Invalid YouTube URL. Paste a valid YouTube link.");
      return;
    }
    // Normalize to standard format
    const normalized = `https://www.youtube.com/watch?v=${id}`;
    if (values.includes(normalized)) {
      setError("This video is already added.");
      return;
    }
    onChange([...values, normalized]);
    setDraft("");
    setError("");
  };

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
          YouTube Videos
        </span>
        <span className="text-[10px] text-slate-400">{values.length} video{values.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Paste YouTube URL…"
          className={inputCls}
        />
        <GhostButton onClick={add}>Add</GhostButton>
      </div>
      {error && <div className="mt-1 text-[11px] text-red-500">{error}</div>}
      {values.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {values.map((url, i) => {
            const id = extractYoutubeId(url);
            return (
              <div key={i} className="group relative flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                {id && (
                  <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                    <img
                      src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                      alt="YouTube thumbnail"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="drop-shadow-md">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] text-slate-600 dark:text-slate-300" title={url}>{url}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                  className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  title="Remove video"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
