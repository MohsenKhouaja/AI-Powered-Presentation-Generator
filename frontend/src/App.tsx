import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthProvider } from "./context/AuthProvider";
import { AppShellLayout } from "./components/app/AppShellLayout";
import {
  AuthenticatedRoute,
  PublicOnlyRoute,
} from "./components/app/RouteGuards";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PresentationViewerPage } from "./pages/PresentationViewerPage";
import { PresentationEditorPage } from "./pages/PresentationEditorPage";
import { SharedPresentationsPage } from "./pages/SharedPresentationsPage";
import { SharedPresentationReadOnlyPage } from "./pages/SharedPresentationReadOnlyPage";
import { ThemeSettingsPage } from "./pages/ThemeSettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            <Route element={<AuthenticatedRoute />}>
              <Route element={<AppShellLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/shared" element={<SharedPresentationsPage />} />
                <Route
                  path="/settings/themes"
                  element={<ThemeSettingsPage />}
                />
              </Route>

              <Route
                path="/presentations/:id"
                element={<PresentationViewerPage />}
              />
              <Route
                path="/presentations/:id/edit"
                element={<PresentationEditorPage />}
              />
              <Route
                path="/shared/:id"
                element={<SharedPresentationReadOnlyPage />}
              />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
