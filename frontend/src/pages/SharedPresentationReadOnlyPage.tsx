import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { PresentationPlayback } from "@/components/PresentationPlayback";
import { usePublicSharedPresentationQuery } from "@/hooks/queries/usePublicShare";

const readTokenFromFragment = (hash: string): string | null => {
  const fragment = hash.replace(/^#/, "");
  return new URLSearchParams(fragment).get("token");
};

export function SharedPresentationReadOnlyPage() {
  const location = useLocation();
  const token = useMemo(
    () => readTokenFromFragment(location.hash),
    [location.hash],
  );
  const presentationQuery = usePublicSharedPresentationQuery(token);
  const slides = useMemo(
    () => presentationQuery.data?.slides ?? [],
    [presentationQuery.data?.slides],
  );

  if (!token || presentationQuery.isError) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Shared presentation unavailable</EmptyTitle>
            <EmptyDescription>
              This link may be invalid, expired, revoked, or replaced.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <Button className="mt-4" asChild>
          <Link to="/">Go to MarkDeck</Link>
        </Button>
      </main>
    );
  }

  if (presentationQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading shared presentation…
        </div>
      </main>
    );
  }

  if (!presentationQuery.data || slides.length === 0) {
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

  return (
    <PresentationPlayback
      title={presentationQuery.data.title}
      slides={slides}
      ariaLabel="Anonymous read-only presentation viewer"
      actions={
        <>
          <Badge>
            <LockIcon className="mr-1 size-3" /> Read-only link
          </Badge>
          <Button asChild size="sm" variant="outline">
            <Link to="/">Exit</Link>
          </Button>
        </>
      }
    />
  );
}
