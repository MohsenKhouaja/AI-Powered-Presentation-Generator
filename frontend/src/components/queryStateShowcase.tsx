import { useMemo, useState } from "react";
import { AlertCircleIcon, FileTextIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreatePresentationMutation,
  useDeletePresentationMutation,
  usePresentationsQuery,
} from "@/hooks/queries/usePresentations";
import {
  useCreateContextMutation,
  useUpdateContextMutation,
} from "@/hooks/queries/useContextsFiles";
import { useReadOnlyShareAccessQuery } from "@/hooks/queries/useShareReadOnly";
import {
  useLogoutMutation,
  useSessionQuery,
} from "@/hooks/queries/useAuthSession";

export function QueryStateShowcase() {
  const [titleInput, setTitleInput] = useState("");
  const [promptInput, setPromptInput] = useState("Context prompt sample");
  const [sharePresentationId, setSharePresentationId] = useState("");

  const sessionQuery = useSessionQuery();
  const logoutMutation = useLogoutMutation();
  const presentationsQuery = usePresentationsQuery();
  const createPresentationMutation = useCreatePresentationMutation();
  const deletePresentationMutation = useDeletePresentationMutation();
  const createContextMutation = useCreateContextMutation();
  const updateContextMutation = useUpdateContextMutation();

  const firstPresentationId = useMemo(
    () => presentationsQuery.data?.[0]?.id ?? null,
    [presentationsQuery.data],
  );

  const shareAccessQuery = useReadOnlyShareAccessQuery(
    sharePresentationId.trim() || firstPresentationId,
    Boolean(sharePresentationId.trim() || firstPresentationId),
  );

  return (
    <div className="mx-auto w-full max-w-5xl p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Task-007 Query State Baseline</CardTitle>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? <Spinner className="size-4" /> : null}
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          {sessionQuery.data?.isLoggedIn ? (
            <p className="text-sm text-muted-foreground">Session is active.</p>
          ) : (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Session unavailable</AlertTitle>
              <AlertDescription>
                Log in to run authenticated queries.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Presentations Query + Mutations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={titleInput}
                onChange={(event) => setTitleInput(event.target.value)}
                placeholder="New presentation title"
              />
              <Button
                onClick={() => {
                  if (!titleInput.trim()) {
                    return;
                  }
                  createPresentationMutation.mutate({
                    title: titleInput.trim(),
                  });
                  setTitleInput("");
                }}
                disabled={createPresentationMutation.isPending}
              >
                {createPresentationMutation.isPending ? <Spinner /> : null}
                Create
              </Button>
            </div>

            {presentationsQuery.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-10/12" />
              </div>
            ) : null}

            {presentationsQuery.isError ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Failed to load presentations</AlertTitle>
                <AlertDescription>
                  {presentationsQuery.error instanceof Error
                    ? presentationsQuery.error.message
                    : "Unknown error"}
                </AlertDescription>
              </Alert>
            ) : null}

            {presentationsQuery.isSuccess &&
            presentationsQuery.data.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileTextIcon />
                  </EmptyMedia>
                  <EmptyTitle>No presentations yet</EmptyTitle>
                  <EmptyDescription>
                    Create one to verify query caching and invalidation.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}

            {presentationsQuery.isSuccess &&
            presentationsQuery.data.length > 0 ? (
              <ul className="space-y-2">
                {presentationsQuery.data.map((presentation) => (
                  <li
                    key={presentation.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <span className="text-sm">{presentation.title}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        deletePresentationMutation.mutate(presentation.id)
                      }
                      disabled={deletePresentationMutation.isPending}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contexts/Files Mutations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={promptInput}
              onChange={(event) => setPromptInput(event.target.value)}
              placeholder="Context prompt"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  createContextMutation.mutate({ prompt: promptInput })
                }
                disabled={createContextMutation.isPending}
              >
                {createContextMutation.isPending ? <Spinner /> : null}
                Create Context
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const contextId = createContextMutation.data?.context.id;
                  if (!contextId) {
                    return;
                  }
                  updateContextMutation.mutate({
                    contextId,
                    prompt: `${promptInput} (updated)`,
                    deletedFilesIds: [],
                  });
                }}
                disabled={
                  updateContextMutation.isPending || !createContextMutation.data
                }
              >
                {updateContextMutation.isPending ? <Spinner /> : null}
                Update Last Context
              </Button>
            </div>
            {createContextMutation.isError || updateContextMutation.isError ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Context mutation failed</AlertTitle>
                <AlertDescription>
                  {(createContextMutation.error as Error | null)?.message ??
                    (updateContextMutation.error as Error | null)?.message ??
                    "Unknown error"}
                </AlertDescription>
              </Alert>
            ) : null}
            {createContextMutation.isSuccess ||
            updateContextMutation.isSuccess ? (
              <p className="text-sm text-muted-foreground">
                Context mutation succeeded and related caches were invalidated.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Read-Only Share Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={sharePresentationId}
            onChange={(event) => setSharePresentationId(event.target.value)}
            placeholder="Presentation ID (optional)"
          />

          {shareAccessQuery.isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner /> Loading share access list...
            </div>
          ) : null}

          {shareAccessQuery.isError ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Share access fetch failed</AlertTitle>
              <AlertDescription>
                {shareAccessQuery.error instanceof Error
                  ? shareAccessQuery.error.message
                  : "Unknown error"}
              </AlertDescription>
            </Alert>
          ) : null}

          {shareAccessQuery.isSuccess && shareAccessQuery.data.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldCheckIcon />
                </EmptyMedia>
                <EmptyTitle>No read-only share entries</EmptyTitle>
                <EmptyDescription>
                  Grant share access in backend flow to populate this list.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          {shareAccessQuery.isSuccess && shareAccessQuery.data.length > 0 ? (
            <ul className="space-y-2">
              {shareAccessQuery.data.map((entry) => (
                <li key={entry.id} className="rounded-md border p-2 text-sm">
                  {entry.email} - {entry.expiresAt ?? "No expiry"}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
