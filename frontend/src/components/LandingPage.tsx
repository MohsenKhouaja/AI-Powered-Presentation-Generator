import { useEffect } from "react";
import { themes } from "@/lib/themes";
import { useTheme } from "@/context/ThemeContext";
import { ThemeButton } from "./ThemeButton";
import { MarkdownRenderer } from "./markdownRenderer";
import contentExample from "../demo.md?raw";
import { ArrowRight, Sparkles, Zap, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const { theme, changeTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      const currentIndex = themes.findIndex((t) => t.id === theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      changeTheme(themes[nextIndex].id);
    }, 1000);

    return () => clearInterval(timer);
  }, [theme, changeTheme]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="h-8 flex items-center justify-center">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                New: AI Themes
              </div>
            </div>

            <div className="min-h-[120px] lg:min-h-[160px] flex items-center justify-center">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl max-w-3xl">
                Create Stunning{" "}
                <span className="text-primary">Presentations</span> in Seconds
              </h1>
            </div>

            <div className="min-h-[84px] flex items-start justify-center">
              <p className="max-w-[700px] text-lg text-muted-foreground">
                Transform your markdown into beautiful, responsive slide decks
                with the power of AI. Choose from our curated collection of themes
                or let AI design one for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center min-h-[48px]">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Powerful Theming Engine
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Watch as your content adapts instantly to different styles. Our
              themes are carefully crafted to ensure readability and beauty.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap justify-center gap-4 transition-all">
              {themes.map((t) => (
                <div key={t.id} className="transition-transform duration-300">
                  <ThemeButton theme={t} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-primary/10 w-fit">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="min-h-[28px] flex items-center">
                <h3 className="text-xl font-bold">Lightning Fast</h3>
              </div>
              <div className="min-h-[72px]">
                <p className="text-muted-foreground">
                  Generates slides instantly from your notes. No more hours spent
                  aligning text boxes.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-primary/10 w-fit">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div className="min-h-[28px] flex items-center">
                <h3 className="text-xl font-bold">Responsive Layouts</h3>
              </div>
              <div className="min-h-[72px]">
                <p className="text-muted-foreground">
                  Slides that not only look good on projectors but also on mobile
                  devices and tablets.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-primary/10 w-fit">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="min-h-[28px] flex items-center">
                <h3 className="text-xl font-bold">AI Enhanced</h3>
              </div>
              <div className="min-h-[72px]">
                <p className="text-muted-foreground">
                  Smart suggestions for layout, colors, and imagery to match your
                  content's tone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Write once, present anywhere
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                You focus on the content. We handle the design. Preview your
                slides in real-time as you write.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Markdown support</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Live Preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>PDF Export</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 p-6 overflow-auto">
                <div className="prose dark:prose-invert max-w-none transform scale-90 origin-top">
                  <MarkdownRenderer content={contentExample} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
