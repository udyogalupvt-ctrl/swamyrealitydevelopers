import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type NavItem = { to: string; label: string; icon: string; exact?: boolean; badgeKey?: "enquiries" };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: "◇", exact: true },
  { to: "/admin/properties", label: "Properties", icon: "▤" },
  { to: "/admin/blog", label: "Blog", icon: "❏" },
  { to: "/admin/faqs", label: "FAQs", icon: "?" },
  { to: "/admin/gallery", label: "Gallery", icon: "▦" },
  { to: "/admin/testimonials", label: "Testimonials", icon: "❝" },
  { to: "/admin/team", label: "Team", icon: "♛" },
  { to: "/admin/enquiries", label: "Enquiries", icon: "✉", badgeKey: "enquiries" },
  { to: "/admin/audit", label: "Audit log", icon: "⧗" },
  { to: "/admin/seed", label: "Seed", icon: "⚙" },
];

type ShellProps = {
  title: string;
  breadcrumb?: { label: string; to?: string }[];
  action?: ReactNode;
  children: ReactNode;
};

export function AdminShell({ title, breadcrumb, action, children }: ShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    // Realtime badge for "new" enquiries.
    const q = query(collection(db, "enquiries"), where("status", "==", "new"));
    const unsub = onSnapshot(q, (s) => setNewCount(s.size), () => setNewCount(0));
    return () => unsub();
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + "/");

  const sidebar = (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 ${
        collapsed ? "w-16" : "w-60"
      } transition-all duration-200`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1E3A5F] font-display text-sm font-semibold text-white">S</div>
        {!collapsed && <div className="font-display text-[15px] font-semibold text-slate-900 dark:text-slate-100">SRD Admin</div>}
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {NAV.map((n) => {
          const active = isActive(n.to, "exact" in n ? n.exact : false);
          const badge = n.badgeKey === "enquiries" && newCount > 0 ? newCount : null;
          return (
            <Link
              key={n.to}
              to={n.to as "/admin"}
              className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition ${
                active
                  ? "bg-[#1E3A5F] text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
              title={collapsed ? n.label : undefined}
            >
              <span className={`grid h-5 w-5 place-items-center text-[13px] ${active ? "text-white" : "text-slate-400"}`}>{n.icon}</span>
              {!collapsed && <span className="flex-1 truncate">{n.label}</span>}
              {!collapsed && badge !== null && (
                <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{badge}</span>
              )}
              {collapsed && badge !== null && (
                <span className="absolute ml-6 -mt-4 rounded-full bg-red-600 px-1 py-0 text-[9px] font-semibold text-white">{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {!collapsed && (
          <div className="mb-2 truncate text-[11px] text-slate-500" title={user?.email || ""}>
            {user?.email}
          </div>
        )}
        <button
          onClick={() => logout().then(() => navigate({ to: "/admin/login" }))}
          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {collapsed ? "→" : "Sign out"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen md:block">{sidebar}</div>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:px-6">
          <button
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >☰</button>
          <button
            className="hidden rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 md:inline-flex dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >{collapsed ? "»" : "«"}</button>
          <div className="min-w-0 flex-1">
            {breadcrumb && breadcrumb.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                {breadcrumb.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {b.to ? <Link to={b.to as "/admin"} className="hover:text-slate-800 dark:hover:text-slate-200">{b.label}</Link> : <span>{b.label}</span>}
                    {i < breadcrumb.length - 1 && <span>/</span>}
                  </span>
                ))}
              </div>
            )}
            <h1 className="truncate font-display text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
          </div>
          {action}
        </header>
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, type = "button", disabled }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md bg-[#1E3A5F] px-3.5 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-[#162a44] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, type = "button", disabled }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</div>
  );
}

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`} />;
}
