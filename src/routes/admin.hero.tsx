import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Card, PrimaryButton, GhostButton, Skeleton } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getHeroConfig } from "@/lib/firestore/queries";
import { updateHeroConfig } from "@/lib/firestore/mutations";
import type { HeroConfigDoc, HeroSlide } from "@/lib/firestore/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Route tree is already patched in routeTree.gen.ts
export const Route = createFileRoute("/admin/hero")({ component: HeroAdmin });

function HeroAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "heroConfig"], queryFn: getHeroConfig });
  const [formData, setFormData] = useState<HeroConfigDoc | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      await updateHeroConfig(formData);
      await qc.invalidateQueries({ queryKey: ["heroConfig"] });
      await qc.invalidateQueries({ queryKey: ["admin", "heroConfig"] });
      toast.success("Hero section updated successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update Hero section.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <AdminShell title="Hero Section">
        <div className="p-8 space-y-4">
          <Skeleton className="h-48" />
        </div>
      </AdminShell>
    );
  }

  const addSlide = () => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        slides: [
          ...prev.slides,
          {
            n: `0${prev.slides.length + 1}`,
            name: "",
            type: "",
            location: "",
            image: { url: "", publicId: "" },
            mobileImage: { url: "", publicId: "" },
          },
        ],
      };
    });
  };

  const updateSlide = (index: number, update: Partial<HeroSlide>) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const newSlides = [...prev.slides];
      newSlides[index] = { ...newSlides[index], ...update };
      return { ...prev, slides: newSlides };
    });
  };

  const removeSlide = (index: number) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const newSlides = prev.slides.filter((_, i) => i !== index);
      // Re-number them
      newSlides.forEach((s, i) => (s.n = `0${i + 1}`));
      return { ...prev, slides: newSlides };
    });
  };

  return (
    <AdminShell
      title="Hero Section"
      action={<PrimaryButton onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</PrimaryButton>}
    >
      <div className="p-8 max-w-4xl space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Main Text</h2>
          <Card className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title 1</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={formData.title1}
                onChange={(e) => setFormData({ ...formData, title1: e.target.value })}
                placeholder="e.g. Building Homes."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title 2</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={formData.title2}
                onChange={(e) => setFormData({ ...formData, title2: e.target.value })}
                placeholder="e.g. Creating Futures."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                rows={3}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. RERA & KAUDA approved..."
              />
            </div>
          </Card>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Slides</h2>
            <PrimaryButton onClick={addSlide}>+ Add Slide</PrimaryButton>
          </div>
          
          <div className="space-y-4">
            {formData.slides.map((slide, index) => (
              <Card key={index} className="p-4 flex gap-6">
                <div className="w-1/3 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Desktop Image</label>
                    <ImageUploader
                      // @ts-ignore - Route tree is patched but IDE might lag
                      value={slide.image?.url ? [slide.image] : []}
                      onChange={(imgs) => updateSlide(index, { image: imgs[0] || { url: "", publicId: "" } })}
                      max={1}
                      multiple={false}
                      folder="swamy/hero"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile Image <span className="text-xs text-gray-400 font-normal">(optional — shown on phones)</span></label>
                    <ImageUploader
                      // @ts-ignore
                      value={slide.mobileImage?.url ? [slide.mobileImage] : []}
                      onChange={(imgs) => updateSlide(index, { mobileImage: imgs[0] || { url: "", publicId: "" } })}
                      max={1}
                      multiple={false}
                      folder="swamy/hero"
                    />
                    {!slide.mobileImage?.url && (
                      <p className="mt-1 text-[11px] text-gray-400">Falls back to desktop image if empty.</p>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-500">Slide {slide.n}</span>
                    <button type="button" onClick={() => removeSlide(index)} className="text-red-500 hover:text-red-700 text-sm hover:underline">Remove</button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Name</label>
                    <input
                      className="w-full border px-3 py-2 rounded"
                      value={slide.name}
                      onChange={(e) => updateSlide(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <input
                        className="w-full border px-3 py-2 rounded"
                        value={slide.type}
                        onChange={(e) => updateSlide(index, { type: e.target.value })}
                        placeholder="e.g. Luxury Apartments"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        className="w-full border px-3 py-2 rounded"
                        value={slide.location}
                        onChange={(e) => updateSlide(index, { location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {formData.slides.length === 0 && (
              <div className="text-center text-gray-500 py-8 border rounded-lg bg-gray-50">
                No slides added yet. Add a slide to show images on the hero section.
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
