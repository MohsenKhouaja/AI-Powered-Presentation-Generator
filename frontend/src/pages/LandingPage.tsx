import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/authForm";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <main
      className="grid min-h-screen grid-cols-1 lg:grid-cols-2"
      aria-labelledby="landing-title"
    >
      <section className="flex flex-col justify-center border-b p-8 lg:border-b-0 lg:border-r lg:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          P2M
        </p>
        <h1
          id="landing-title"
          className="mt-4 text-4xl font-bold tracking-tight md:text-5xl"
        >
          MARKDOWN TO PRESENTATION
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Transform your ideas into presentation slides with a minimal, focused
          workflow.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={() =>
              document
                .getElementById("auth-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Get Started Free
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/", { replace: true })}
          >
            Sign In
          </Button>
        </div>
      </section>
      <section
        id="auth-form"
        className="flex items-center justify-center p-6 md:p-10"
        aria-label="Authentication form"
      >
        <AuthForm />
      </section>
    </main>
  );
}
