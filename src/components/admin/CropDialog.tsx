import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

export type AspectPreset = "free" | "1:1" | "4:3" | "3:4" | "4:5" | "16:9" | "9:16" | "3:2";

const PRESETS: { key: AspectPreset; label: string; value: number | undefined }[] = [
  { key: "free", label: "Original", value: undefined },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "9:16", label: "9:16", value: 9 / 16 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "3:4", label: "3:4", value: 3 / 4 },
  { key: "4:5", label: "4:5", value: 4 / 5 },
  { key: "3:2", label: "3:2", value: 3 / 2 },
];

type Props = {
  file: File;
  initialAspect?: AspectPreset;
  fileIndex?: number;
  fileTotal?: number;
  onCancel: () => void;
  onSkip: () => void;
  onConfirm: (blob: Blob) => void;
};

async function cropToBlob(src: string, area: Area, mime: string): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), mime, 0.92);
  });
}

export function CropDialog({ file, initialAspect = "free", fileIndex, fileTotal, onCancel, onSkip, onConfirm }: Props) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const [aspectKey, setAspectKey] = useState<AspectPreset>(initialAspect);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const aspect = PRESETS.find((p) => p.key === aspectKey)?.value;

  const onComplete = useCallback((_c: Area, px: Area) => setArea(px), []);

  const confirm = async () => {
    if (!area) return;
    setBusy(true);
    try {
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await cropToBlob(url, area, mime);
      onConfirm(blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <div className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Crop image</div>
            <div className="text-[11px] text-slate-500">
              {fileTotal && fileTotal > 1 ? `${(fileIndex ?? 0) + 1} of ${fileTotal} · ` : ""}
              {file.name}
            </div>
          </div>
          <button type="button" onClick={onCancel} className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Close">✕</button>
        </div>

        <div className="relative h-[60vh] w-full bg-slate-900">
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
            restrictPosition={false}
            objectFit="contain"
          />
        </div>

        <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Aspect ratio</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setAspectKey(p.key)}
                  className={`rounded-md border px-2.5 py-1 text-[12px] font-medium transition ${
                    aspectKey === p.key
                      ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Zoom</span>
              <span>{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#1E3A5F]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-[13px] text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
            <button type="button" onClick={onSkip} className="rounded-md border border-slate-300 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Use original</button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy || !area}
              className="rounded-md bg-[#1E3A5F] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#264a76] disabled:opacity-60"
            >
              {busy ? "Cropping…" : "Apply crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
