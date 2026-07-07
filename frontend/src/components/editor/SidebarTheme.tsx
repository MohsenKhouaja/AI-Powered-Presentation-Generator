"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeDropdown } from "@/components/ThemeDropdown";

export function SidebarTheme() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-medium">Theme</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Adjust the slide canvas theme without changing the editor UI.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <ThemeToggle />
        <ThemeDropdown />
      </div>
    </div>
  );
}