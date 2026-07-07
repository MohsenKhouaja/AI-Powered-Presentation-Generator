import { AuthForm } from "@/components/authForm";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <main
      className="grid min-h-screen grid-cols-1 lg:grid-cols-5"
      aria-labelledby="landing-title"
    >
      <section className="col-span-1 flex flex-col justify-center border-b p-8 lg:col-span-3 lg:border-b-0 lg:border-r lg:p-16">
        <div className="animate-fade-in-up mb-6 h-px w-12 bg-foreground/10" style={{ animationDelay: "0ms" }} />
        <h1
          id="landing-title"
          className="animate-fade-in-up max-w-3xl text-6xl font-bold leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl"
          style={{ animationDelay: "100ms" }}
        >
          Write markdown.
          <br />
          Present slides.
        </h1>
        <p
          className="animate-fade-in-up mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground"
          style={{ animationDelay: "200ms" }}
        >
          Turn notes into slides in seconds. Write in markdown, preview live,
          present anywhere. No formatting, no design tools, no distractions.
        </p>

        <div className="animate-fade-in-up mt-10 flex items-center gap-4" style={{ animationDelay: "300ms" }}>
          <Button
            size="lg"
            onClick={() =>
              document
                .getElementById("auth-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Get Started Free
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              document
                .getElementById("auth-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Sign In
          </Button>
        </div>
      </section>
      <section
        id="auth-form"
        className="animate-fade-in-up col-span-1 flex items-center justify-center bg-muted/30 p-6 md:p-10 lg:col-span-2"
        style={{ animationDelay: "400ms" }}
        aria-label="Authentication form"
      >
        <AuthForm />
      </section>
    </main>
  );
}
