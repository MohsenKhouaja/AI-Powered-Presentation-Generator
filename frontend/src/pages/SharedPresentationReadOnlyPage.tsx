import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  LockIcon,
} from "lucide-react";
import { usePresentationDetailQuery } from "@/hooks/queries/usePresentations";
import { useReadOnlyShareAccessQuery } from "@/hooks/queries/useShareReadOnly";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function SharedPresentationReadOnlyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const detailQuery = usePresentationDetailQuery(id ?? null, Boolean(id));
  const shareAccessQuery = useReadOnlyShareAccessQuery(id ?? null, Boolean(id));
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = useMemo(
    () => detailQuery.data?.slides ?? [],
    [detailQuery.data?.slides],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setSlideIndex((current) =>
          Math.min(current + 1, Math.max(slides.length - 1, 0)),
        );
      }
      if (event.key === "ArrowLeft") {
        setSlideIndex((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Escape") {
        navigate("/shared");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, slides.length]);

  if (detailQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading shared presentation...
        </div>
      </main>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Failed to load shared presentation</AlertTitle>
          <AlertDescription>
            {detailQuery.error instanceof Error
              ? detailQuery.error.message
              : "Unknown error"}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" asChild>
          <Link to="/shared">Back to shared list</Link>
        </Button>
      </main>
    );
  }

  if (slides.length === 0) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl p-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No slides available</EmptyTitle>
            <EmptyDescription>
              This shared presentation has no slide content.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    );
  }

  const currentSlide = slides[slideIndex];
  const progressValue = ((slideIndex + 1) / slides.length) * 100;

  return (
    <main
      className="grid min-h-screen grid-rows-[1fr_auto] bg-background"
      aria-label="Shared read-only viewer"
    >
      <section className="mx-auto flex w-full max-w-6xl items-center p-4 md:p-8">
        <article className="w-full rounded-xl border bg-card p-6 shadow-sm md:p-10">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg font-semibold md:text-xl">
              {detailQuery.data.title}
            </h1>
            <div className="flex items-center gap-2">
              <Badge>
                <LockIcon className="mr-1 size-3" /> Read-only
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link to="/shared">Exit</Link>
              </Button>
            </div>
          </header>

          {shareAccessQuery.isSuccess ? (
            <p className="mb-4 text-xs text-muted-foreground">
              Shared with {shareAccessQuery.data.length} user
              {shareAccessQuery.data.length === 1 ? "" : "s"}
            </p>
          ) : null}

          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentSlide.content}
            </ReactMarkdown>
          </div>
        </article>
      </section>

      <footer className="sticky bottom-0 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setSlideIndex((current) => Math.max(current - 1, 0))}
            disabled={slideIndex === 0}
            aria-label="Previous slide"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="min-w-[100px] text-sm text-muted-foreground">
            {slideIndex + 1}/{slides.length}
          </div>
          <Progress
            value={progressValue}
            className="h-2 min-w-[150px] flex-1"
          />
          <Button
            variant="outline"
            onClick={() =>
              setSlideIndex((current) =>
                Math.min(current + 1, Math.max(slides.length - 1, 0)),
              )
            }
            disabled={slideIndex >= slides.length - 1}
            aria-label="Next slide"
          >
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </footer>
    </main>
  );
}
