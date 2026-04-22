import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeButton } from "@/components/ThemeButton";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { themes } from "@/lib/themes";

export function ThemeSettingsPage() {
  return (
    <div className="space-y-4">
      <header className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Theme Customizer</h2>
            <p className="text-sm text-muted-foreground">
              Choose a theme and tone for your workspace.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeftIcon className="mr-1 size-4" /> Back
            </Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current theme</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <ThemeDropdown />
        </CardContent>
      </Card>

      <section
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Theme options"
      >
        {themes.map((theme) => (
          <ThemeButton key={theme.id} theme={theme} />
        ))}
      </section>
    </div>
  );
}
