import { AuthForm } from "./components/authForm";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <AuthForm></AuthForm>
    </AuthProvider>
  );
}
