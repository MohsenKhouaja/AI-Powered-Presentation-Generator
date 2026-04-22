import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  CopyIcon,
  EyeIcon,
  PlusIcon,
  SaveIcon,
  Share2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useContextByPresentationQuery,
  useContextFilesQuery,
  useCreateContextMutation,
  useUpdateContextMutation,
} from "@/hooks/queries/useContextsFiles";
import {
  usePresentationDetailQuery,
  useUpdatePresentationMutation,
} from "@/hooks/queries/usePresentations";
import {
  useGenerateShareLinkMutation,
  useInvitePresentationAccessMutation,
  useReadOnlyShareAccessQuery,
  useRemovePresentationAccessMutation,
} from "@/hooks/queries/useShareReadOnly";

interface EditableSlide {
  id: string;
  content: string;
  slideOrder: number;
}

export function PresentationEditorPage() {
  const { id } = useParams<{ id: string }>();
  const detailQuery = usePresentationDetailQuery(id ?? null, Boolean(id));
  const linkedContextQuery = useContextByPresentationQuery(id ?? null);

  const [createdContextId, setCreatedContextId] = useState<string | null>(null);
  const [promptDraft, setPromptDraft] = useState<string | null>(null);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [slidesOverride, setSlidesOverride] = useState<EditableSlide[] | null>(
    null,
  );
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [saveState, setSaveState] = useState<
    "idle" | "dirty" | "saving" | "saved" | "error"
  >("idle");
  const [editorError, setEditorError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [deletedFilesIds, setDeletedFilesIds] = useState<string[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string | null>(
    null,
  );

  const createContextMutation = useCreateContextMutation();
  const updateContextMutation = useUpdateContextMutation();
  const updatePresentationMutation = useUpdatePresentationMutation();
  const activeContextId =
    createdContextId ?? linkedContextQuery.data?.id ?? null;
  const contextFilesQuery = useContextFilesQuery(
    activeContextId,
    Boolean(activeContextId),
  );
  const shareAccessQuery = useReadOnlyShareAccessQuery(id ?? null, Boolean(id));
  const inviteAccessMutation = useInvitePresentationAccessMutation(id ?? null);
  const removeAccessMutation = useRemovePresentationAccessMutation(id ?? null);
  const generateShareLinkMutation = useGenerateShareLinkMutation(id ?? null);

  const slides = useMemo(
    () =>
      slidesOverride ??
      detailQuery.data?.slides.map((slide) => ({
        id: slide.id,
        content: slide.content,
        slideOrder: slide.slideOrder,
      })) ??
      [],
    [slidesOverride, detailQuery.data?.slides],
  );
  const titleDraft = titleOverride ?? detailQuery.data?.title ?? "";
  const safeSelectedSlideIndex = Math.min(
    selectedSlideIndex,
    Math.max(slides.length - 1, 0),
  );
  const currentSlide = slides[safeSelectedSlideIndex];
  const markdownDraft = currentSlide ? currentSlide.content : "";
  const effectivePromptDraft =
    promptDraft ?? linkedContextQuery.data?.prompt ?? "";

  const markDirty = () => {
    setSaveState((current) => (current === "saving" ? current : "dirty"));
  };

  const onPersistPresentation = async () => {
    if (!id) {
      return;
    }

    const normalizedTitle = titleDraft.trim();
    if (!normalizedTitle) {
      setSaveState("error");
      setEditorError("Presentation title is required.");
      return;
    }

    setSaveState("saving");
    setEditorError(null);

    try {
      const updated = await updatePresentationMutation.mutateAsync({
        presentationId: id,
        title: normalizedTitle,
        slides: slides.map((slide, index) => ({
          content: slide.content,
          slideOrder: index + 1,
        })),
      });

      setTitleOverride(updated.title);
      setSlidesOverride(
        updated.slides.map((slide) => ({
          id: slide.id,
          content: slide.content,
          slideOrder: slide.slideOrder,
        })),
      );
      setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      setEditorError(
        error instanceof Error ? error.message : "Failed to save presentation",
      );
    }
  };

  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length || fromIndex === toIndex) {
      return;
    }

    setSlidesOverride((currentSlides) => {
      const sourceSlides = currentSlides ?? slides;
      const nextSlides = [...sourceSlides];
      const [movedSlide] = nextSlides.splice(fromIndex, 1);
      nextSlides.splice(toIndex, 0, movedSlide);

      return nextSlides.map((slide, index) => ({
        ...slide,
        slideOrder: index + 1,
      }));
    });

    setSelectedSlideIndex(toIndex);
    markDirty();
  };

  const onAddSlide = () => {
    const newSlide: EditableSlide = {
      id: globalThis.crypto?.randomUUID?.() ?? `new-${Date.now()}`,
      content: "# New Slide",
      slideOrder: slides.length + 1,
    };

    setSlidesOverride((currentSlides) => [
      ...(currentSlides ?? slides),
      newSlide,
    ]);
    setSelectedSlideIndex(slides.length);
    markDirty();
  };

  const onGenerateShareLink = async () => {
    const result = await generateShareLinkMutation.mutateAsync();
    setGeneratedShareUrl(result.shareUrl);
  };

  const onCopyShareLink = async () => {
    const linkToCopy =
      generatedShareUrl ??
      `${window.location.origin}/shared/${detailQuery.data?.id ?? ""}`;
    await navigator.clipboard.writeText(linkToCopy);
  };

  const onInviteAccess = async (event: FormEvent) => {
    event.preventDefault();

    const email = inviteEmail.trim();
    if (!email) {
      return;
    }

    const expiresAtIso = inviteExpiresAt
      ? new Date(inviteExpiresAt).toISOString()
      : null;

    await inviteAccessMutation.mutateAsync({
      email,
      expiresAt: expiresAtIso,
    });

    setInviteEmail("");
    setInviteExpiresAt("");
  };

  const onPickFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setPendingFiles((current) => [...current, ...nextFiles]);
    event.target.value = "";
  };

  const onSaveContext = async (event: FormEvent) => {
    event.preventDefault();

    if (activeContextId) {
      await updateContextMutation
        .mutateAsync({
          contextId: activeContextId,
          prompt: effectivePromptDraft,
          files: pendingFiles,
          deletedFilesIds,
        })
        .catch(() => undefined);
    } else {
      const result = await createContextMutation
        .mutateAsync({
          prompt: effectivePromptDraft,
          files: pendingFiles,
        })
        .catch(() => null);
      if (result?.context.id) {
        setCreatedContextId(result.context.id);
      }
    }

    setPendingFiles([]);
    setDeletedFilesIds([]);
  };

  const mutationError =
    createContextMutation.error ?? updateContextMutation.error;

  if (detailQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading editor...
        </div>
      </main>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Failed to open editor</AlertTitle>
          <AlertDescription>
            {detailQuery.error instanceof Error
              ? detailQuery.error.message
              : "Unknown error"}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    );
  }

  return (
    <main
      className="mx-auto w-full max-w-7xl space-y-4 p-4 md:p-6"
      aria-label="Presentation editor"
    >
      <header className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/presentations/${detailQuery.data.id}`}>
                <ArrowLeftIcon className="mr-1 size-4" /> Back
              </Link>
            </Button>
            <Input
              value={titleDraft}
              onChange={(event) => {
                setTitleOverride(event.target.value);
                markDirty();
              }}
              className="max-w-sm"
              aria-label="Presentation title"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewVisible((current) => !current)}
            >
              <EyeIcon className="mr-1 size-4" />
              {isPreviewVisible ? "Hide Preview" : "Preview"}
            </Button>
            <Button
              size="sm"
              onClick={onPersistPresentation}
              disabled={updatePresentationMutation.isPending}
            >
              {updatePresentationMutation.isPending ? (
                <Spinner className="mr-1" />
              ) : (
                <SaveIcon className="mr-1 size-4" />
              )}
              {saveState === "saved" ? "Saved" : "Save"}
            </Button>
            <ThemeToggle />
            <ThemeDropdown />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2Icon className="mr-1 size-4" /> Share
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {saveState === "saving" ? "Saving changes..." : null}
          {saveState === "saved" ? "All changes saved." : null}
          {saveState === "dirty" ? "Unsaved changes." : null}
          {saveState === "error" ? "Save failed. Try again." : null}
        </div>
        {editorError ? (
          <p className="mt-1 text-xs text-destructive">{editorError}</p>
        ) : null}
      </header>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Context</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSaveContext} className="space-y-3">
                <Textarea
                  value={effectivePromptDraft}
                  onChange={(event) => setPromptDraft(event.target.value)}
                  placeholder="Add prompt context for AI generation"
                  rows={6}
                  aria-label="Context prompt"
                />
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="context-files"
                  >
                    Files
                  </label>
                  <Input
                    id="context-files"
                    type="file"
                    multiple
                    onChange={onPickFiles}
                    aria-describedby="context-files-help"
                  />
                  <p
                    id="context-files-help"
                    className="text-xs text-muted-foreground"
                  >
                    PDF, DOCX, TXT, MD, PNG, JPG
                  </p>
                </div>

                <div className="space-y-2">
                  {contextFilesQuery.data?.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded border px-2 py-1 text-xs"
                    >
                      <span className="line-clamp-1">{file.originalName}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() =>
                          setDeletedFilesIds((current) => [...current, file.id])
                        }
                        aria-label={`Mark ${file.originalName} for deletion`}
                      >
                        <XIcon className="size-3" />
                      </Button>
                    </div>
                  ))}

                  {pendingFiles.map((file) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      className="flex items-center justify-between rounded border px-2 py-1 text-xs"
                    >
                      <span className="line-clamp-1">{file.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() =>
                          setPendingFiles((current) =>
                            current.filter((candidate) => candidate !== file),
                          )
                        }
                        aria-label={`Remove ${file.name}`}
                      >
                        <XIcon className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    createContextMutation.isPending ||
                    updateContextMutation.isPending
                  }
                >
                  {createContextMutation.isPending ||
                  updateContextMutation.isPending ? (
                    <Spinner className="mr-2" />
                  ) : (
                    <SaveIcon className="mr-2 size-4" />
                  )}
                  Save Context
                </Button>
              </form>

              {mutationError ? (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircleIcon />
                  <AlertTitle>Context save failed</AlertTitle>
                  <AlertDescription>
                    {mutationError instanceof Error
                      ? mutationError.message
                      : "Unknown error"}
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Manage share link and collaborators from the Share action in the
                toolbar.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share2Icon className="mr-2 size-4" /> Open Share
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="grid gap-4 xl:grid-rows-[1fr_auto]">
          <div
            className={`grid gap-4 ${isPreviewVisible ? "lg:grid-cols-2" : ""}`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Markdown Editor</CardTitle>
              </CardHeader>
              <CardContent>
                {slides.length === 0 ? (
                  <Empty className="border">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UploadIcon className="size-4" />
                      </EmptyMedia>
                      <EmptyTitle>No slides found</EmptyTitle>
                      <EmptyDescription>
                        This presentation currently has no slides to edit.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Textarea
                    value={markdownDraft}
                    onChange={(event) => {
                      if (!currentSlide) {
                        return;
                      }
                      const nextValue = event.target.value;
                      setSlidesOverride((currentSlides) => {
                        const sourceSlides = currentSlides ?? slides;

                        return sourceSlides.map((slide, index) =>
                          index === safeSelectedSlideIndex
                            ? { ...slide, content: nextValue }
                            : slide,
                        );
                      });
                      markDirty();
                    }}
                    rows={20}
                    className="font-mono"
                    aria-label="Markdown editor"
                  />
                )}
              </CardContent>
            </Card>

            {isPreviewVisible ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[400px] rounded border p-4">
                    <div className="prose prose-neutral max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdownDraft}
                      </ReactMarkdown>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Slide Navigator</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onAddSlide}
                >
                  <PlusIcon className="mr-1 size-4" /> Add Slide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="flex flex-wrap items-center gap-2"
                role="tablist"
                aria-label="Slides"
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="flex items-center gap-1 rounded-md border px-2 py-1"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSlideIndex(index);
                      }}
                      className="rounded-md px-2 py-1 text-xs hover:bg-muted"
                      aria-selected={index === selectedSlideIndex}
                      role="tab"
                    >
                      <span>Slide {index + 1}</span>
                      {index === selectedSlideIndex ? (
                        <Badge className="ml-2">Active</Badge>
                      ) : null}
                    </button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => moveSlide(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`Move slide ${index + 1} up`}
                    >
                      <ArrowUpIcon className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => moveSlide(index, index + 1)}
                      disabled={index === slides.length - 1}
                      aria-label={`Move slide ${index + 1} down`}
                    >
                      <ArrowDownIcon className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground">
                Slide changes persist when you click Save.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Presentation</DialogTitle>
            <DialogDescription>
              Generate a share link, invite collaborators, and manage existing
              access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Shareable link</p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={
                    generatedShareUrl ??
                    `${window.location.origin}/shared/${detailQuery.data.id}`
                  }
                  aria-label="Shareable link"
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={onGenerateShareLink}
                  disabled={generateShareLinkMutation.isPending}
                >
                  {generateShareLinkMutation.isPending ? <Spinner /> : null}
                  Generate
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onCopyShareLink}
                >
                  <CopyIcon className="mr-1 size-4" /> Copy
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Collaborators</p>
              {shareAccessQuery.isPending ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner /> Loading access list...
                </div>
              ) : null}

              {shareAccessQuery.isError ? (
                <p className="text-sm text-destructive">
                  {shareAccessQuery.error instanceof Error
                    ? shareAccessQuery.error.message
                    : "Failed to load share access"}
                </p>
              ) : null}

              {shareAccessQuery.isSuccess &&
              shareAccessQuery.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No collaborators yet.
                </p>
              ) : null}

              {shareAccessQuery.isSuccess && shareAccessQuery.data.length > 0
                ? shareAccessQuery.data.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded border px-2 py-2 text-xs"
                    >
                      <div>
                        <p>{entry.email}</p>
                        <p className="text-muted-foreground">
                          {entry.expiresAt
                            ? new Date(entry.expiresAt).toLocaleString()
                            : "No expiration"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => removeAccessMutation.mutate(entry.id)}
                        disabled={removeAccessMutation.isPending}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                : null}
            </div>

            <Separator />

            <form className="space-y-2" onSubmit={onInviteAccess}>
              <p className="text-sm font-medium">Invite collaborator</p>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="name@example.com"
                aria-label="Invite collaborator email"
              />
              <Input
                type="datetime-local"
                value={inviteExpiresAt}
                onChange={(event) => setInviteExpiresAt(event.target.value)}
                aria-label="Invite expiration"
              />
              <Button type="submit" disabled={inviteAccessMutation.isPending}>
                {inviteAccessMutation.isPending ? (
                  <Spinner className="mr-1" />
                ) : null}
                Invite
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
