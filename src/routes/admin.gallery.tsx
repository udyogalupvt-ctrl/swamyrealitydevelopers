import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Card, GhostButton, PrimaryButton, Skeleton } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllGallery } from "@/lib/firestore/admin-queries";
import { createGallery, deleteGallery, updateGallery } from "@/lib/firestore/mutations";
import type { CloudinaryImage, GalleryImageDoc } from "@/lib/firestore/types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/admin/gallery")({ component: GalleryAdmin });

const CATS = ["Exteriors", "Interiors", "Amenities", "Site", "Events"];

function GalleryAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "gallery"], queryFn: listAllGallery });
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [items, setItems] = useState<GalleryImageDoc[]>([]);

  // Sync local order state whenever firestore data changes.
  useMemo(() => { if (data) setItems(data); }, [data]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  };

  const addImages = async (imgs: CloudinaryImage[]) => {
    try {
      const base = (data?.length ?? 0);
      await Promise.all(imgs.map((img, i) =>
        createGallery({ image: img, title: "", category: "Exteriors", displayOrder: base + i, isActive: true })
      ));
      toast.success(`Added ${imgs.length} image${imgs.length === 1 ? "" : "s"}`);
      refresh();
    } catch (e) { toast.error((e as Error).message); }
  };

  const patch = async (id: string, patchData: Partial<GalleryImageDoc>) => {
    try { await updateGallery(id, patchData); toast.success("Saved"); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const del = async (id: string) => {
    try { await deleteGallery(id); toast.success("Deleted"); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((v) => v.id === active.id);
    const newIndex = items.findIndex((v) => v.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    try {
      await Promise.all(next.map((it, i) => it.displayOrder === i ? null : updateGallery(it.id, { displayOrder: i })));
      toast.success("Order saved");
      refresh();
    } catch (err) { toast.error((err as Error).message); }
  };

  return (
    <AdminShell title="Gallery" breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Gallery" }]}>
      <Card className="mb-6 p-4">
        <ImageUploader folder="swamy/gallery" value={[]} onChange={addImages} multiple />
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Skeleton className="aspect-square" /><Skeleton className="aspect-square" /><Skeleton className="aspect-square" /><Skeleton className="aspect-square" /></div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-[13px] text-slate-500">No gallery images yet. Drop some above to get started.</Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {items.map((it) => (
                <GalleryTile key={it.id} item={it} onPatch={patch} onDelete={() => setConfirmDel(it.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete image?"
        message="This removes the item from the gallery collection."
        confirmLabel="Delete"
        danger
        onConfirm={() => confirmDel && del(confirmDel)}
        onClose={() => setConfirmDel(null)}
      />
    </AdminShell>
  );
}

function GalleryTile({ item, onPatch, onDelete }: { item: GalleryImageDoc; onPatch: (id: string, p: Partial<GalleryImageDoc>) => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [title, setTitle] = useState(item.title || "");
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={item.image?.url} alt={item.title || ""} className="h-full w-full object-cover" />
          <button {...attributes} {...listeners} className="absolute left-2 top-2 cursor-grab rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white" title="Drag to reorder">⋮⋮</button>
          <button onClick={onDelete} className="absolute right-2 top-2 rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">Delete</button>
        </div>
        <div className="space-y-2 p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== item.title && onPatch(item.id, { title })}
            placeholder="Title"
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] dark:border-slate-700 dark:bg-slate-950"
          />
          <div className="flex items-center gap-2">
            <select
              value={item.category}
              onChange={(e) => onPatch(item.id, { category: e.target.value })}
              className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] dark:border-slate-700 dark:bg-slate-950"
            >
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={item.isActive} onChange={(e) => onPatch(item.id, { isActive: e.target.checked })} /> Active
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
