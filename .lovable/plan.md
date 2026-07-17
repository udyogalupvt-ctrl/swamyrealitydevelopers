# Firebase + Cloudinary Integration

Keep every public-facing design, animation and copy exactly as-is. Only the *data source* changes.

## 1. Dependencies & Config

- `bun add firebase @tanstack/react-query`
- New env vars in `.env` (VITE_ prefixed) for the seven Firebase config values + Cloudinary cloud name + unsigned preset.
- `src/lib/firebase.ts` — initialise app, export `app`, `db` (Firestore), `auth`. No Firebase Storage.
- `src/lib/cloudinary.ts` — `uploadToCloudinary(file, folder, onProgress)` via XHR (progress support); `cldUrl(publicId, { w, blur })` builds `f_auto,q_auto,c_fill,w_<n>` URLs; helper `cldSrcSet(publicId)` producing 400/800/1200/1600 widths; helper `cldPlaceholder(publicId)` with `e_blur:400,q_1`.

## 2. Firestore Data Layer

- `src/lib/firestore/types.ts` — `Property`, `BlogPost`, `Faq`, `GalleryImage`, `Enquiry`, `Admin`.
- `src/lib/firestore/queries.ts` — typed reads used by pages:
  - `listPublishedProperties()`, `getFeaturedProperties()`, `getPropertyBySlug(slug)`
  - `listPublishedPosts()`, `getPostBySlug(slug)`
  - `listActiveFaqs()`, `listHomepageFaqs()`
  - `listGalleryImages()`
- `src/lib/firestore/mutations.ts` — `createEnquiry(...)`, plus admin CRUD for each collection.
- React Query wrapping via a small hooks file `src/lib/queries.ts` (`useProperties`, `useProperty`, `usePosts`, `usePost`, `useFaqs`, `useGallery`) with sensible `staleTime`.
- Wire the `QueryClientProvider` inside `__root.tsx` (single client instance).

## 3. Security Rules

- Write `firestore.rules` matching the spec (public read for content collections, admin-only writes, public create + admin read for `enquiries`, admin-only reads on `admins`).
- Include client-side validation on enquiry create (required name/mobile, message length ≤ 2000, honeypot field ignored server-side but blocks submits client-side).
- Tell the user in plain language: **paste `firestore.rules` into Firebase Console → Firestore → Rules → Publish**.

## 4. Admin Auth

- `src/lib/auth-context.tsx` — `AuthProvider` exposing `{ user, isAdmin, loading, login, logout }`. `onAuthStateChanged` + `admins/{uid}` existence check; if not admin, sign out immediately with a friendly error.
- Persist sessions via Firebase default (localStorage).
- Wrap the tree in `__root.tsx` inside `QueryClientProvider`.

## 5. Admin Routes (all under `/admin/*`, hidden from public nav)

- `src/routes/admin/route.tsx` — layout with `<Outlet />`, dark sidebar (Dashboard, Properties, Blog, FAQs, Gallery, Enquiries, Seed, Logout), styled to match the site (navy, Clash Display, no new colors). Redirects to `/admin/login` if not admin; shows a matched skeleton while auth resolves (never flashes the dashboard).
- `src/routes/admin/login.tsx` — Swamy logo, floating-label email/password, loading state, error banner. No public signup.
- `src/routes/admin/index.tsx` — dashboard counts (properties, posts, enquiries new count, gallery).
- `src/routes/admin/properties.tsx` — table + create/edit modal (all fields incl. cover + gallery via Cloudinary uploader with progress bar).
- `src/routes/admin/blog.tsx` — table + editor (simple textarea for HTML content, cover upload).
- `src/routes/admin/faqs.tsx` — CRUD table with `showOnHomepage`, `displayOrder`, `isActive` toggles.
- `src/routes/admin/gallery.tsx` — grid uploader (Cloudinary), category & order fields.
- `src/routes/admin/enquiries.tsx` — read-only list, mark status new/contacted/closed.
- `src/routes/admin/seed.tsx` — one-click seed button (admin-only) that writes the existing 6 properties, 12 blog posts, all FAQs (6 flagged homepage) and gallery images to Firestore. Idempotent (checks slugs / questions).

Reusable admin components: `AdminShell`, `CloudinaryUploader`, `AdminTable`, `Field` (reuse contact page's floating-label).

## 6. Rewire Public Pages (no visual change)

- `src/routes/index.tsx` — featured properties + homepage FAQs now come from Firestore hooks; keep existing hardcoded fallback stripped once wired. Add matching skeletons for the featured-projects grid and FAQ list (same shapes as the real cards).
- `src/routes/properties.tsx` + `properties.$slug.tsx` — Firestore queries; skeleton grid for listing; skeleton detail (gallery, sticky enquiry card) for detail. `getPropertyBySlug` powers loader + head og:image.
- `src/routes/blog.tsx` + `blog.$slug.tsx` — Firestore; featured post = first published (ordered `publishedAt desc`).
- `src/routes/faq.tsx` — Firestore active faqs grouped by category; live search stays client-side.
- `src/routes/gallery.tsx` — Firestore active images ordered by `displayOrder`. Category chips derived from the data.
- All `<img>` swapped to `cldUrl(...)` + `srcSet` where the image is a Cloudinary publicId; Unsplash URLs used in dev seed remain valid because they're passed through as full `url` strings (rendered directly when `publicId` is empty).
- Every page gets skeletons + empty state + error state matching the design (no layout shift).

## 7. Forms → Enquiries

- `/contact` form, property detail sticky enquiry, homepage CTA form (if any) → all `createEnquiry(...)`. Keep the existing floating-label + animated checkmark success.
- Client-side rate limit: refuse a second submit within 20 s per session; ignore submits when honeypot `website` field is non-empty (a hidden input added to each form, not visible in UI).

## 8. Seed Content

- Existing static content in `src/lib/properties.ts`, `src/lib/blog.ts`, `src/lib/faqs.ts`, and the Gallery `IMAGES` array is imported by `/admin/seed` and written to Firestore verbatim (copy unchanged). Images stay on Unsplash URLs (stored as `{ url, publicId: "" }` — the site still renders them; when admin re-uploads, they move to Cloudinary).
- Mark 6 FAQs as `showOnHomepage: true`.

## 9. Post-integration user actions (I will tell you clearly)

1. Enable **Email/Password** in Firebase Console → Authentication.
2. Create your first admin user (Authentication → Add User), then in Firestore create a doc under `admins/{that uid}` with `{ email, name, role: "admin" }`.
3. Paste `firestore.rules` into Firestore → Rules → Publish.
4. Add composite indexes when the console prompts (properties by `isPublished + displayOrder`, blogPosts by `isPublished + publishedAt desc`, faqs by `isActive + displayOrder`).
5. Sign in at `/admin/login`, hit **Seed Content** once, then start managing real data.

## Technical Notes

- Env access uses `import.meta.env.VITE_*` (client-safe). No server functions needed — Firestore rules protect writes.
- `useLenis`, Framer Motion, existing SiteChrome, and all design tokens stay untouched.
- All new work is additive; the file-level touch list is: `.env` (values only), `src/lib/firebase.ts`, `src/lib/cloudinary.ts`, `src/lib/firestore/*`, `src/lib/auth-context.tsx`, `src/lib/queries.ts`, `firestore.rules`, `src/routes/__root.tsx` (wrap providers), the six existing public route files (data source swap + skeletons), and 8 new `src/routes/admin/*` files.
