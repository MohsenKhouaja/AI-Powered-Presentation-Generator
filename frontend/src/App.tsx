import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <h1>Presentation App</h1>
      </AuthProvider>
    </ThemeProvider>
  );
}
