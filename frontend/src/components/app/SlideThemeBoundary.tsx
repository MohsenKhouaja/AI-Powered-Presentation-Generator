import type React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

type SlideThemeBoundaryProps = {
  children: React.ReactNode;
  className?: string;
};

export function SlideThemeBoundary({
  children,
  className,
}: SlideThemeBoundaryProps) {
  const { theme, tone } = useTheme();

  return (
    <div
      data-theme={theme}
      className={cn(tone === "dark" ? "dark" : "", className)}
    >
      {children}
    </div>
  );
}
