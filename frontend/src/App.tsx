import { AuthForm } from "./components/authForm";
import { MarkdownRenderer } from "./components/markdownRenderer";
import { AuthProvider } from "./context/AuthProvider";
import contentExample from "./demo.md?raw";

export default function App() {
  return (
    <AuthProvider>
      <MarkdownRenderer content={contentExample}></MarkdownRenderer>
    </AuthProvider>
  );
}
