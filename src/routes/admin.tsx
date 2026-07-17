import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Swamy Reality Developers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminGate,
});

function AdminGate() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute = location.pathname.startsWith("/admin/login");

  useEffect(() => {
    if (loading) return;
    if (!isLoginRoute && (!user || !isAdmin)) {
      navigate({ to: "/admin/login" });
    }
  }, [loading, user, isAdmin, isLoginRoute, navigate]);

  if (isLoginRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </div>
    );
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm text-slate-500">Checking access…</div>
      </div>
    );
  }

  return <Outlet />;
}
