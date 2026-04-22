import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

function RouteGateLoading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Checking session...
      </div>
    </main>
  );
}

export function AuthenticatedRoute() {
  const { isLoading, isLoggedIn } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteGateLoading />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return <RouteGateLoading />;
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
