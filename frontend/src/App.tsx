import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { LandingPage } from "./components/LandingPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LandingPage />
      </AuthProvider>
    </ThemeProvider>
  );
}
