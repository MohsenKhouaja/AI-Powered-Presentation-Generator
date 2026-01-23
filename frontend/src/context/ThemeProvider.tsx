import type React from "react";
import themeContext from "./ThemeContext";
import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const defaultTheme = { theme: "default", tone: "root" };
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || defaultTheme.theme,
  );
  const [tone, setTone] = useState(
    localStorage.getItem("tone") || defaultTheme.tone,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.remove("root", "dark");
    document.documentElement.classList.add(tone);
    localStorage.setItem("theme", theme);
    localStorage.setItem("tone", tone);
  }, [theme, tone]);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
  };

  const toggleTone = (newTone: string) => {
    setTone(newTone);
  };

  return (
    <themeContext.Provider value={{ theme, tone, changeTheme, toggleTone }}>
      {children}
    </themeContext.Provider>
  );
}
