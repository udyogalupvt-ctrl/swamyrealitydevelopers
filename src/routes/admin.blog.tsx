import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Card, GhostButton, PrimaryButton, Skeleton } from "@/components/admin/AdminShell";
import { ConfirmDialog, useUnsavedGuard } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllPosts } from "@/lib/firestore/admin-queries";
import { createPost, deletePost, updatePost } from "@/lib/firestore/mutations";
import type { BlogPostDoc, CloudinaryImage } from "@/lib/firestore/types";
import { useState } from "react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/admin/blog")({ component: BlogAdmin });

const CATEGORIES = ["Investment", "Buying Guide", "Market Trends", "Legal", "Localities"];

type Form = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: CloudinaryImage;
  category: string;
  author: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  publishedAt: string; // yyyy-mm-dd
};

const empty = (): Form => ({
  slug: "", title: "", excerpt: "", content: "",
  coverImage: { url: "", publicId: "" },
  category: "Buying Guide", author: "SRD Editorial", readTime: "6 min read",
  metaTitle: "", metaDescription: "", isPublished: false,
  publishedAt: new Date().toISOString().slice(0, 10),
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function docToForm(d: BlogPostDoc): Form {
  return {
    id: d.id, slug: d.slug, title: d.title, excerpt: d.excerpt || "",
    content: d.content || "", coverImage: d.coverImage || { url: "", publicId: "" },
    category: d.category || "Buying Guide", author: d.author || "SRD Editorial",
    readTime: d.readTime || "6 min read",
    metaTitle: d.metaTitle || "", metaDescription: d.metaDescription || "",
    isPublished: !!d.isPublished,
    publishedAt: d.publishedAt?.toDate?.().toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
  };
}

function BlogAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "posts"], queryFn: listAllPosts });
  const [editing, setEditing] = useState<Form | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "posts"] }); qc.invalidateQueries({ queryKey: ["posts"] }); };

  return (
    <AdminShell
      title="Blog"
      breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Blog" }]}
      action={<PrimaryButton onClick={() => setEditing(empty())}>+ New Post</PrimaryButton>}
    >
      {isLoading ? (
        <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="p-10 text-center text-[13px] text-slate-500">No blog posts yet.</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-950/50">
                <tr>
                  <th className="px-4 py-2.5">Post</th>
                  <th className="px-4 py-2.5 hidden md:table-cell">Category</th>
                  <th className="px-4 py-2.5 hidden md:table-cell">Published</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                          {p.coverImage?.url && <img src={p.coverImage.url} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{p.title}</div>
                          <div className="truncate text-[11px] text-slate-500">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-slate-500">{p.publishedAt?.toDate?.().toLocaleDateString?.() || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <GhostButton onClick={() => setEditing(docToForm(p))}>Edit</GhostButton>
                        <button onClick={() => setConfirmDel(p.id)} className="rounded-md border border-red-200 px-2 py-1 text-[12px] text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editing && (
        <BlogEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
      <ConfirmDialog
        open={!!confirmDel}
        title="Delete post?"
        message="This permanently removes the post."
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (!confirmDel) return;
          try { await deletePost(confirmDel); toast.success("Post deleted"); refresh(); }
          catch (e) { toast.error((e as Error).message); }
        }}
        onClose={() => setConfirmDel(null)}
      />
    </AdminShell>
  );
}

function BlogEditor({ initial, onClose, onSaved }: { initial: Form; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Form>(initial);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  useUnsavedGuard(dirty);
  const closeGuarded = () => { if (dirty && !confirm("Discard unsaved changes?")) return; onClose(); };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!f.title.trim() || !f.slug.trim()) { toast.error("Title and slug are required"); return; }
    setSaving(true);
    try {
      const payload = {
        slug: f.slug, title: f.title, excerpt: f.excerpt, content: f.content,
        coverImage: f.coverImage, category: f.category, author: f.author,
        readTime: f.readTime, metaTitle: f.metaTitle, metaDescription: f.metaDescription,
        isPublished: f.isPublished,
        publishedAt: Timestamp.fromDate(new Date(f.publishedAt)),
      };
      if (f.id) { await updatePost(f.id, payload); toast.success("Post updated"); }
      else { await createPost(payload); toast.success("Post created"); }
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={closeGuarded}>
      <div className="my-8 w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{f.id ? "Edit post" : "New post"}</h3>
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => setPreview((p) => !p)}>{preview ? "Edit" : "Preview"}</GhostButton>
            <button onClick={closeGuarded} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
          </div>
        </div>

        {preview ? (
          <article className="prose prose-slate mx-auto max-w-2xl dark:prose-invert">
            {f.coverImage?.url && <img src={f.coverImage.url} alt={f.title} className="mb-6 aspect-[16/9] w-full rounded-lg object-cover" />}
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#1E3A5F] dark:text-slate-300">{f.category}</div>
            <h1 className="font-display">{f.title}</h1>
            <p className="text-slate-600 dark:text-slate-400"><em>{f.excerpt}</em></p>
            <div className="text-[12px] text-slate-500">By {f.author} • {f.readTime} • {f.publishedAt}</div>
            <hr />
            <div dangerouslySetInnerHTML={{ __html: f.content }} />
          </article>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" required>
                <input value={f.title} onChange={(e) => { const v = e.target.value; set("title", v); if (!slugTouched) set("slug", slugify(v)); }} className={inputCls} />
              </Field>
              <Field label="Slug" required>
                <input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} className={inputCls} />
              </Field>
              <Field label="Category">
                <select value={f.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Author">
                <input value={f.author} onChange={(e) => set("author", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Read time">
                <input value={f.readTime} onChange={(e) => set("readTime", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Publish date">
                <input type="date" value={f.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className={inputCls} />
              </Field>
            </div>

            <Field label="Excerpt">
              <textarea rows={2} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Cover image">
              <ImageUploader
                folder="swamy/blog"
                value={f.coverImage?.url ? [f.coverImage] : []}
                onChange={(v) => set("coverImage", v[0] || { url: "", publicId: "" })}
                multiple={false}
                max={1}
                aspectRatio="16:9"
              />
            </Field>

            <Field label="Content">
              <RichTextEditor value={f.content} onChange={(html) => set("content", html)} folder="swamy/blog" />
            </Field>

            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">SEO</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Meta title" hint={`${f.metaTitle.length}/60`}>
                  <input value={f.metaTitle} maxLength={80} onChange={(e) => set("metaTitle", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Meta description" hint={`${f.metaDescription.length}/160`}>
                  <input value={f.metaDescription} maxLength={200} onChange={(e) => set("metaDescription", e.target.value)} className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[13px]">
              <label className="flex items-center gap-2"><input type="checkbox" checked={f.isPublished} onChange={(e) => set("isPublished", e.target.checked)} /> Published</label>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <GhostButton onClick={closeGuarded}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>{saving ? "Saving…" : f.id ? "Save changes" : "Create post"}</PrimaryButton>
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
