import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/themes";
import { useTheme } from "@/context/ThemeContext";

interface ThemeButtonProps {
  theme: Theme;
}

export function ThemeButton({ theme }: ThemeButtonProps) {
  const { theme: currentTheme, changeTheme } = useTheme();
  const isActive = currentTheme === theme.id;

  const backgroundColor =
    theme.colors[1]?.replace(")", " / 0.1)") || "transparent";

  return (
    <button
      onClick={() => changeTheme(theme.id)}
      className={cn(
        "flex min-w-[160px] cursor-pointer items-center justify-center rounded-md border px-4 py-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        isActive
          ? "ring-2 ring-primary ring-offset-2 bg-background scale-105 shadow-xl"
          : "border-transparent bg-primary/5 hover:bg-primary/10",
      )}
      style={{
        backgroundColor: isActive ? undefined : backgroundColor, // Let CSS handle active state or override here
      }}
    >
      <div className="flex items-center gap-2.5 text-center">
        <div className="flex gap-1">
          {theme.colors.map((color, i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-sm border border-black/10 dark:border-white/10"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="px-1 text-sm font-medium capitalize leading-tight text-foreground">
          {theme.name}
        </span>
      </div>
    </button>
  );
}
