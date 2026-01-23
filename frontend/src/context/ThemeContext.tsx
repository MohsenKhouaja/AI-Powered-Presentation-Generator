import { createContext, useContext } from "react";

type ThemeContextType = {
  theme: string;
  tone: string;
  changeTheme: (newTheme: string) => void;
  toggleTone: (newTone: string) => void;
};

const themeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const theme: ThemeContextType | null = useContext(themeContext);
  if (!theme) {
    throw new Error("use theme must be used within theme provvider");
  }
  return theme;
}

export default themeContext;
