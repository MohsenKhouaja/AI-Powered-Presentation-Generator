import { useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PencilIcon } from "lucide-react";
import { usePresentationDetailQuery } from "@/hooks/queries/usePresentations";
import { usePresentationSlidesQuery } from "@/hooks/queries/useSlides";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { PresentationPlayback } from "@/components/PresentationPlayback";

export function PresentationViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const detailQuery = usePresentationDetailQuery(id ?? null, Boolean(id));
  const slidesQuery = usePresentationSlidesQuery(id ?? null, Boolean(id));
  const slides = useMemo(() => slidesQuery.data ?? [], [slidesQuery.data]);
  const exitViewer = useCallback(() => navigate("/dashboard"), [navigate]);

  if (detailQuery.isPending || slidesQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading presentation...
        </div>
      </main>
    );
  }

  if (detailQuery.isError || slidesQuery.isError) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
        <p className="text-sm text-muted-foreground">Failed to load presentation.</p>
        <Button className="mt-4" asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    );
  }

  if (!detailQuery.data || slides.length === 0) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl p-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No slides available</EmptyTitle>
            <EmptyDescription>
              Add content in the editor to display slides here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    );
  }

  return (
    <PresentationPlayback
      title={detailQuery.data.title}
      slides={slides}
      ariaLabel="Presentation viewer"
      onExit={exitViewer}
      actions={
        <>
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard">Exit</Link>
          </Button>
          {detailQuery.data.capabilities.editContent ? (
            <Button asChild size="sm" variant="outline">
              <Link to={`/presentations/${detailQuery.data.id}/edit`}>
                <PencilIcon className="mr-1 size-4" /> Edit
              </Link>
            </Button>
          ) : null}
        </>
      }
    />
  );
}
