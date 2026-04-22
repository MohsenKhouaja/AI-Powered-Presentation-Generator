import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
      <Empty className="w-full border">
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The route you requested does not exist.
          </EmptyDescription>
        </EmptyHeader>
        <Button asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </Empty>
    </main>
  );
}
