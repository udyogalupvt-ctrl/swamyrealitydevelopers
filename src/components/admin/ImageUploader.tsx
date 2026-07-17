import { useCallback, useRef, useState } from "react";
import { uploadImage, MAX_SIZE_BYTES, type UploadFolder } from "@/lib/cloudinary";
import type { CloudinaryImage } from "@/lib/firestore/types";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CropDialog, type AspectPreset } from "./CropDialog";

type Props = {
  folder: UploadFolder;
  value: CloudinaryImage[];
  onChange: (next: CloudinaryImage[]) => void;
  multiple?: boolean;
  max?: number;
  label?: string;
  /** Enables the crop step before upload. Defaults to true. */
  enableCrop?: boolean;
  /** Default aspect ratio preset for the crop dialog. */
  aspectRatio?: AspectPreset;
};

type Pending = { id: string; name: string; progress: number; error?: string };

export function ImageUploader({ folder, value, onChange, multiple = true, max, label, enableCrop = true, aspectRatio = "free" }: Props) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [drag, setDrag] = useState(false);
  const [queue, setQueue] = useState<File[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadOne = useCallback(
    async (source: File | Blob, name: string): Promise<CloudinaryImage | null> => {
      const id = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      if (!source.type.startsWith("image/")) {
        setPending((p) => [...p, { id, name, progress: 0, error: "Not an image" }]);
        return null;
      }
      if (source.size > MAX_SIZE_BYTES * 4) {
        setPending((p) => [...p, { id, name, progress: 0, error: "File too large (>20MB)" }]);
        return null;
      }
      const file = source instanceof File ? source : new File([source], name, { type: source.type });
      setPending((p) => [...p, { id, name, progress: 0 }]);
      try {
        const res = await uploadImage(file, folder, (pct) =>
          setPending((p) => p.map((x) => (x.id === id ? { ...x, progress: pct } : x)))
        );
        setPending((p) => p.filter((x) => x.id !== id));
        return res;
      } catch (e) {
        setPending((p) => p.map((x) => (x.id === id ? { ...x, error: (e as Error).message } : x)));
        return null;
      }
    },
    [folder]
  );

  const finishBatch = useCallback(
    (uploaded: CloudinaryImage[]) => {
      if (uploaded.length) onChange(multiple ? [...value, ...uploaded] : uploaded);
    },
    [multiple, onChange, value]
  );

  const uploadedRef = useRef<CloudinaryImage[]>([]);

  const advanceQueue = useCallback(
    async (opts: { blob?: Blob; skip?: boolean; cancel?: boolean }) => {
      const files = queue;
      const idx = queueIndex;
      if (opts.cancel) {
        finishBatch(uploadedRef.current);
        uploadedRef.current = [];
        setQueue([]);
        setQueueIndex(0);
        return;
      }
      const current = files[idx];
      if (current) {
        const source: File | Blob = opts.blob ?? current;
        const res = await uploadOne(source, current.name);
        if (res) uploadedRef.current.push(res);
      }
      const nextIdx = idx + 1;
      if (nextIdx >= files.length) {
        finishBatch(uploadedRef.current);
        uploadedRef.current = [];
        setQueue([]);
        setQueueIndex(0);
      } else {
        setQueueIndex(nextIdx);
      }
    },
    [queue, queueIndex, uploadOne, finishBatch]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      const room = max ? Math.max(0, max - (multiple ? value.length : 0)) : Infinity;
      const toUpload = multiple ? arr.slice(0, room) : arr.slice(0, 1);
      if (!toUpload.length) return;
      if (enableCrop) {
        uploadedRef.current = [];
        setQueue(toUpload);
        setQueueIndex(0);
        return;
      }
      const uploaded: CloudinaryImage[] = [];
      for (const file of toUpload) {
        const res = await uploadOne(file, file.name);
        if (res) uploaded.push(res);
      }
      finishBatch(uploaded);
    },
    [enableCrop, finishBatch, max, multiple, uploadOne, value.length]
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((v) => v.publicId + v.url === active.id);
    const newIndex = value.findIndex((v) => v.publicId + v.url === over.id);
    if (oldIndex >= 0 && newIndex >= 0) onChange(arrayMove(value, oldIndex, newIndex));
  };

  const singleWithValue = !multiple && value.length > 0;

  return (
    <div>
      {label && <div className="mb-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300">{label}</div>}

      {singleWithValue ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`group relative aspect-[16/9] w-full max-w-md cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition ${
            drag ? "border-[#1E3A5F] bg-[#1E3A5F]/5" : "border-slate-300 dark:border-slate-700"
          }`}
        >
          <img src={value[0].url} alt="" className="h-full w-full object-cover" />
          <div className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 text-[12px] font-medium text-white transition ${drag ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            {drag ? "Drop to replace" : "Click or drop a new image to replace"}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            className="absolute right-2 top-2 rounded bg-red-600/90 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100"
          >
            Remove
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }}
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center text-[13px] transition ${
            drag ? "border-[#1E3A5F] bg-[#1E3A5F]/5" : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600"
          }`}
        >
          <div className="font-medium text-slate-700 dark:text-slate-200">Drop images or click to upload</div>
          <div className="mt-1 text-[11px] text-slate-500">PNG, JPG, WebP — up to 5MB each (larger images are auto-compressed)</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }}
          />
        </div>
      )}

      {singleWithValue && (
        <div className="mt-2 max-w-md">
          <label className="mb-1 block text-[11px] font-medium text-slate-500">
            Alt text <span className="font-normal text-slate-400">(for SEO & screen readers)</span>
          </label>
          <input
            type="text"
            value={value[0].alt || ""}
            placeholder="Describe what's in the image"
            onChange={(e) => onChange([{ ...value[0], alt: e.target.value }])}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:border-[#1E3A5F] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {pending.map((p) => (
            <div key={p.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="truncate">{p.name}</span>
                <span className={p.error ? "text-red-600" : "text-slate-500"}>{p.error || `${p.progress}%`}</span>
              </div>
              {!p.error && (
                <div className="mt-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-[#1E3A5F] transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              )}
              {p.error && (
                <button className="mt-1 text-[11px] underline text-slate-500" onClick={() => setPending((s) => s.filter((x) => x.id !== p.id))}>
                  Dismiss
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {multiple && value.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[11px] text-slate-500">Drag thumbnails to reorder. Position 1 shows first.</div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={value.map((v) => v.publicId + v.url)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {value.map((img, i) => (
                  <SortableThumb
                    key={img.publicId + img.url}
                    id={img.publicId + img.url}
                    img={img}
                    index={i}
                    onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
                    onAltChange={(alt) => onChange(value.map((v, idx) => (idx === i ? { ...v, alt } : v)))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {queue.length > 0 && queue[queueIndex] && (
        <CropDialog
          file={queue[queueIndex]}
          initialAspect={aspectRatio}
          fileIndex={queueIndex}
          fileTotal={queue.length}
          onCancel={() => advanceQueue({ cancel: true })}
          onSkip={() => advanceQueue({ skip: true })}
          onConfirm={(blob) => advanceQueue({ blob })}
        />
      )}
    </div>
  );
}

function SortableThumb({ id, img, index, onRemove, onAltChange }: { id: string; img: CloudinaryImage; index: number; onRemove: () => void; onAltChange: (alt: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-square">
        <img src={img.url} alt={img.alt || ""} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex justify-between p-1.5">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100"
            title="Drag to reorder"
          >
            ⋮⋮ {index + 1}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100"
          >
            Remove
          </button>
        </div>
      </div>
      <input
        type="text"
        value={img.alt || ""}
        placeholder="Alt text"
        onChange={(e) => onAltChange(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full border-t border-slate-200 bg-white px-2 py-1 text-[11px] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        aria-label={`Alt text for image ${index + 1}`}
      />
    </div>
  );
}
