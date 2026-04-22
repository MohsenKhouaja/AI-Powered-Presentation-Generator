import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertCircleIcon, Share2Icon } from "lucide-react";
import { usePresentationsQuery } from "@/hooks/queries/usePresentations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function SharedPresentationsPage() {
  const presentationsQuery = usePresentationsQuery();

  const sharedPresentations = useMemo(
    () =>
      (presentationsQuery.data ?? []).filter(
        (presentation) => presentation.AccessType === "edit",
      ),
    [presentationsQuery.data],
  );

  return (
    <div className="space-y-4">
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Shared presentations</h2>
        <p className="text-sm text-muted-foreground">
          Presentations you can access in read-only mode.
        </p>
      </section>

      {presentationsQuery.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading shared presentations...
        </div>
      ) : null}

      {presentationsQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Failed to load shared presentations</AlertTitle>
          <AlertDescription>
            {presentationsQuery.error instanceof Error
              ? presentationsQuery.error.message
              : "Unexpected error while loading shared presentations."}
          </AlertDescription>
        </Alert>
      ) : null}

      {presentationsQuery.isSuccess && sharedPresentations.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Share2Icon />
            </EmptyMedia>
            <EmptyTitle>No shared presentations</EmptyTitle>
            <EmptyDescription>
              Shared items will appear here once access is granted.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {presentationsQuery.isSuccess && sharedPresentations.length > 0 ? (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label="Shared presentations list"
        >
          {sharedPresentations.map((presentation) => (
            <Card key={presentation.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base">
                  {presentation.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Shared access: read-only view
                </p>
                <Badge variant="outline" className="mt-2">
                  Shared
                </Badge>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/presentations/${presentation.id}`}>Viewer</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to={`/shared/${presentation.id}`}>Read-only share</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}
