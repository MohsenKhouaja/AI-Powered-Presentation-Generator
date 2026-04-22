import { LayoutDashboard, LogOut, Palette, Share2 } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLogoutMutation } from "@/hooks/queries/useAuthSession";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shared", label: "Shared", icon: Share2 },
  { to: "/settings/themes", label: "Themes", icon: Palette },
] as const;

export function AppShellLayout() {
  const logoutMutation = useLogoutMutation();

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[220px_1fr]">
      <aside className="border-r bg-muted/20 p-4" aria-label="Sidebar">
        <p className="px-2 pb-3 text-sm font-semibold tracking-wide">P2M</p>
        <nav className="space-y-1" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary"
                      : "text-foreground",
                  )
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <h1 className="text-lg font-semibold">Presentation Workspace</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ThemeDropdown />
            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              aria-label="Logout"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6" aria-live="polite">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
