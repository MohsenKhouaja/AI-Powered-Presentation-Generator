import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileTextIcon,
  PlusCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
import { PresentationCard } from "@/components/PresentationCard";

export function DashboardPage() {
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const presentationsQuery = usePresentationsQuery();
  const createMutation = useCreatePresentationMutation();
  const deleteMutation = useDeletePresentationMutation();
  const presentations = presentationsQuery.data ?? [];
  const ownedPresentations = presentations.filter(
    (presentation) => presentation.AccessType === "own",
  );
  const editablePresentations = presentations.filter(
    (presentation) => presentation.AccessType === "edit",
  );

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }

    const created = await createMutation
      .mutateAsync({ title: nextTitle })
      .catch(() => undefined);
    if (created) {
      navigate(`/presentations/${created.id}/edit`);
      return;
    }
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

      {presentationsQuery.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading presentations...
        </div>
      ) : null}

      {presentationsQuery.isSuccess ? (
        <div className="space-y-10">
          <section className="space-y-4" aria-label="Owned presentations">
            <header className="space-y-2">
              <p className="text-sm font-medium text-[color:var(--color-gravel)] font-[var(--font-inter)]">
                Owned
              </p>
              <h3 className="font-[var(--font-waldenburg)] text-[32px] leading-[1.17] tracking-[-0.02em] text-[color:var(--color-obsidian)]">
                Your presentations
              </h3>
            </header>
            {ownedPresentations.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileTextIcon />
                  </EmptyMedia>
                  <EmptyTitle>No owned presentations</EmptyTitle>
                  <EmptyDescription>
                    Create a presentation to see it here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ownedPresentations.map((presentation) => (
                  <PresentationCard
                    key={presentation.id}
                    id={presentation.id}
                    title={presentation.title}
                    createdAt={presentation.createdAt}
                    badgeLabel="Owner"
                    badgeVariant="outline"
                    actions={[
                      { type: "link", label: "View", to: `/presentations/${presentation.id}`, variant: "outline" },
                      { type: "link", label: "Edit", to: `/presentations/${presentation.id}/edit`, variant: "outline" },
                      { type: "button", label: "Delete", onClick: () => deleteMutation.mutate(presentation.id), variant: "destructive", disabled: deleteMutation.isPending },
                    ]}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4" aria-label="Editable presentations">
            <header className="space-y-2">
              <p className="text-sm font-medium text-[color:var(--color-gravel)] font-[var(--font-inter)]">
                Editable
              </p>
              <h3 className="font-[var(--font-waldenburg)] text-[32px] leading-[1.17] tracking-[-0.02em] text-[color:var(--color-obsidian)]">
                Shared with you
              </h3>
            </header>
            {editablePresentations.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileTextIcon />
                  </EmptyMedia>
                  <EmptyTitle>No editable presentations</EmptyTitle>
                  <EmptyDescription>
                    Collaborations with edit access will appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {editablePresentations.map((presentation) => (
                  <PresentationCard
                    key={presentation.id}
                    id={presentation.id}
                    title={presentation.title}
                    createdAt={presentation.createdAt}
                    badgeLabel="Shared edit"
                    badgeVariant="outline"
                    actions={[
                      { type: "link", label: "View", to: `/presentations/${presentation.id}`, variant: "outline" },
                      { type: "link", label: "Edit", to: `/presentations/${presentation.id}/edit`, variant: "outline" },
                      { type: "button", label: "Delete", onClick: () => deleteMutation.mutate(presentation.id), variant: "destructive", disabled: true },
                    ]}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}