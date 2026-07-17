import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell, Card, Skeleton } from "@/components/admin/AdminShell";
import { useQuery } from "@tanstack/react-query";
import { listAllProperties, listAllPosts, listAllFaqs, listAllGallery } from "@/lib/firestore/admin-queries";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EnquiryDoc } from "@/lib/firestore/types";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const props = useQuery({ queryKey: ["admin", "properties"], queryFn: listAllProperties });
  const posts = useQuery({ queryKey: ["admin", "posts"], queryFn: listAllPosts });
  const faqs = useQuery({ queryKey: ["admin", "faqs"], queryFn: listAllFaqs });
  const gallery = useQuery({ queryKey: ["admin", "gallery"], queryFn: listAllGallery });

  const [enquiries, setEnquiries] = useState<(EnquiryDoc & { id: string })[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [enquiriesError, setEnquiriesError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"), limit(10));
    const unsub = onSnapshot(
      q,
      (s) => {
        setEnquiries(s.docs.map((d) => ({ id: d.id, ...(d.data() as EnquiryDoc) })));
        setEnquiriesLoading(false);
      },
      (e) => { setEnquiriesError(e.message); setEnquiriesLoading(false); }
    );
    return () => unsub();
  }, []);

  const newCount = enquiries.filter((e) => e.status === "new").length;

  const publishedPosts = (posts.data || []).filter((p) => p.isPublished).length;

  const cards = [
    { label: "Properties", value: props.data?.length ?? 0, loading: props.isLoading },
    { label: "Blog posts (published)", value: publishedPosts, loading: posts.isLoading },
    { label: "FAQs", value: faqs.data?.length ?? 0, loading: faqs.isLoading },
    { label: "Gallery images", value: gallery.data?.length ?? 0, loading: gallery.isLoading },
    { label: "New enquiries", value: newCount, loading: enquiriesLoading, badge: newCount > 0 },
  ];

  return (
    <AdminShell title="Dashboard" breadcrumb={[{ label: "Admin" }, { label: "Dashboard" }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-500">
              <span>{c.label}</span>
              {c.badge && <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">New</span>}
            </div>
            <div className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {c.loading ? <Skeleton className="h-8 w-14" /> : c.value}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <h2 className="font-display text-[15px] font-semibold">Recent enquiries</h2>
            <Link to="/admin/enquiries" className="text-[12px] font-medium text-[#1E3A5F] hover:underline dark:text-slate-300">View all →</Link>
          </div>
          {enquiriesError && <div className="p-4 text-[12px] text-red-600">{enquiriesError}</div>}
          {enquiriesLoading ? (
            <div className="space-y-2 p-4"><Skeleton /><Skeleton /><Skeleton /></div>
          ) : enquiries.length === 0 ? (
            <div className="p-5 text-[13px] text-slate-500">No enquiries yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {enquiries.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium">{e.name}</div>
                    <div className="truncate text-[11px] text-slate-500">{e.mobile} • {e.sourcePage}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {e.status === "new" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">New</span>}
                    <a href={`tel:${e.mobile}`} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Call</a>
                    <a href={`https://wa.me/91${e.mobile.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${e.name}, thanks for reaching out to Swamy Reality Developers.`)}`} target="_blank" rel="noreferrer" className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700">WA</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <h2 className="font-display text-[15px] font-semibold">Recent blog posts</h2>
            <Link to="/admin/blog" className="text-[12px] font-medium text-[#1E3A5F] hover:underline dark:text-slate-300">Manage →</Link>
          </div>
          {posts.isLoading ? (
            <div className="space-y-2 p-4"><Skeleton /><Skeleton /><Skeleton /></div>
          ) : (posts.data || []).length === 0 ? (
            <div className="p-5 text-[13px] text-slate-500">No posts yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(posts.data || []).slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                    {p.coverImage?.url && <img src={p.coverImage.url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{p.title}</div>
                    <div className="truncate text-[11px] text-slate-500">{p.category} • {p.isPublished ? "Published" : "Draft"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
