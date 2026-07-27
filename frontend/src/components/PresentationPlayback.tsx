import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SlideCanvas } from "@/components/SlideCanvas";
import { SlideNavigationFooter } from "@/components/SlideNavigationFooter";

interface PresentationPlaybackProps {
  title: string;
  slides: Array<{ id: string; content: string | null }>;
  actions: ReactNode;
  ariaLabel: string;
  onExit?: () => void;
}

export function PresentationPlayback({
  title,
  slides,
  actions,
  ariaLabel,
  onExit,
}: PresentationPlaybackProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setSlideIndex((current) =>
          Math.min(current + 1, Math.max(slides.length - 1, 0)),
        );
      } else if (event.key === "ArrowLeft") {
        setSlideIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === "Escape") {
        onExit?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit, slides.length]);

  const currentSlide = slides[Math.min(slideIndex, slides.length - 1)];
  const previousSlide = useCallback(
    () => setSlideIndex((current) => Math.max(current - 1, 0)),
    [],
  );
  const nextSlide = useCallback(
    () =>
      setSlideIndex((current) =>
        Math.min(current + 1, Math.max(slides.length - 1, 0)),
      ),
    [slides.length],
  );

  return (
    <main
      className="grid min-h-screen grid-rows-[1fr_auto] bg-background"
      aria-label={ariaLabel}
    >
      <section className="mx-auto flex w-full max-w-6xl items-center p-4 md:p-8">
        <div className="w-full">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-semibold">{title}</h1>
            <div className="flex items-center gap-2">{actions}</div>
          </header>
          <div
            role="region"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Slide ${slideIndex + 1} of ${slides.length}`}
          >
            <SlideCanvas content={currentSlide.content} />
          </div>
        </div>
      </section>
      <SlideNavigationFooter
        slideIndex={slideIndex}
        totalSlides={slides.length}
        onPrevious={previousSlide}
        onNext={nextSlide}
      />
    </main>
  );
}
