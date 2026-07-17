import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";
import { PROPERTIES } from "@/lib/properties";
import { POSTS as BLOG_POSTS } from "@/lib/blog";

function urlEntry(loc: string, lastmod?: string, changefreq = "weekly", priority = "0.7") {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const staticRoutes = [
    { path: "/", priority: "1.0", freq: "weekly" },
    { path: "/properties", priority: "0.9", freq: "weekly" },
    { path: "/about", priority: "0.8", freq: "monthly" },
    { path: "/gallery", priority: "0.7", freq: "monthly" },
    { path: "/blog", priority: "0.8", freq: "weekly" },
    { path: "/faq", priority: "0.6", freq: "monthly" },
    { path: "/contact", priority: "0.7", freq: "monthly" },
  ];
  const urls: string[] = [];
  for (const r of staticRoutes) urls.push(urlEntry(r.path, today, r.freq, r.priority));
  for (const p of PROPERTIES) urls.push(urlEntry(`/properties/${p.slug}`, today, "weekly", "0.85"));
  for (const b of BLOG_POSTS) {
    const post = b as { slug: string; date?: string; publishedAt?: string };
    urls.push(urlEntry(`/blog/${post.slug}`, post.date || post.publishedAt || today, "monthly", "0.6"));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
