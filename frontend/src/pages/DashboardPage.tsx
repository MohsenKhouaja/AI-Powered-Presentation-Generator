import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircleIcon,
  FileTextIcon,
  PlusCircleIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  useCreatePresentationMutation,
  useDeletePresentationMutation,
  usePresentationsQuery,
} from "@/hooks/queries/usePresentations";

export function DashboardPage() {
  const [title, setTitle] = useState("");
  const presentationsQuery = usePresentationsQuery();
  const createMutation = useCreatePresentationMutation();
  const deleteMutation = useDeletePresentationMutation();

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }

    await createMutation
      .mutateAsync({ title: nextTitle })
      .catch(() => undefined);
    setTitle("");
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Create and manage your presentations.
        </p>
      </section>

      <form
        onSubmit={onCreate}
        className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row"
        aria-label="Create presentation form"
      >
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Presentation title"
          aria-label="Presentation title"
        />
        <Button
          type="submit"
          disabled={createMutation.isPending || !title.trim()}
        >
          {createMutation.isPending ? (
            <Spinner className="mr-2" />
          ) : (
            <PlusCircleIcon className="mr-2 size-4" />
          )}
          Create Presentation
        </Button>
      </form>

      {createMutation.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Could not create presentation</AlertTitle>
          <AlertDescription>
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : "Unexpected error while creating presentation."}
          </AlertDescription>
        </Alert>
      ) : null}

      {presentationsQuery.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading presentations...
        </div>
      ) : null}

      {presentationsQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Failed to load presentations</AlertTitle>
          <AlertDescription>
            {presentationsQuery.error instanceof Error
              ? presentationsQuery.error.message
              : "Unexpected error while loading presentations."}
          </AlertDescription>
        </Alert>
      ) : null}

      {presentationsQuery.isSuccess && presentationsQuery.data.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>No presentations yet</EmptyTitle>
            <EmptyDescription>
              Start by creating your first presentation.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {presentationsQuery.isSuccess && presentationsQuery.data.length > 0 ? (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label="Presentations list"
        >
          {presentationsQuery.data.map((presentation) => (
            <Card key={presentation.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base">
                  {presentation.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(presentation.createdAt).toLocaleString()}
                </p>
                <Badge variant="outline" className="mt-2">
                  {presentation.AccessType === "own" ? "Owner" : "Shared edit"}
                </Badge>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/presentations/${presentation.id}`}>View</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/presentations/${presentation.id}/edit`}>
                    Edit
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(presentation.id)}
                  disabled={
                    deleteMutation.isPending ||
                    presentation.AccessType !== "own"
                  }
                >
                  <Trash2Icon className="mr-1 size-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}
