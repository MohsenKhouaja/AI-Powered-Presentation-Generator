import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  EyeIcon,
  GripVerticalIcon,
  PlusIcon,
  SaveIcon,
  Share2Icon,
  Trash2Icon,
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
import { ThemeDropdown } from "@/components/ThemeDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SlideThemeBoundary } from "@/components/app/SlideThemeBoundary";
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
import { useInvitePresentationAccessMutation } from "@/hooks/queries/useShareReadOnly";
import {
  useCreateSlideMutation,
  useDeleteSlideMutation,
  useGenerateSlidesFromContextMutation,
  usePresentationSlidesQuery,
  useReorderSlidesMutation,
  useUpdateSlideContentMutation,
} from "@/hooks/queries/useSlides";

export function PresentationEditorPage() {
  const { id } = useParams<{ id: string }>();
  const detailQuery = usePresentationDetailQuery(id ?? null, Boolean(id));
  const slidesQuery = usePresentationSlidesQuery(id ?? null, Boolean(id));
  const linkedContextQuery = useContextByPresentationQuery(id ?? null);

  const [createdContextId, setCreatedContextId] = useState<string | null>(null);
  const [promptDraft, setPromptDraft] = useState<string | null>(null);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [draftById, setDraftById] = useState<Record<string, string>>({});
  const [lastSavedById, setLastSavedById] = useState<Record<string, string>>(
    {},
  );
  const [isSavedVisible, setIsSavedVisible] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [deletedFilesIds, setDeletedFilesIds] = useState<string[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [draggingSlideId, setDraggingSlideId] = useState<string | null>(null);
  const [dragOverSlideId, setDragOverSlideId] = useState<string | null>(null);
  const autosaveTimersRef = useRef<Record<string, number>>({});
  const savingSlidesRef = useRef<Set<string>>(new Set());
  const savedTimerRef = useRef<number | null>(null);

  const createContextMutation = useCreateContextMutation();
  const updateContextMutation = useUpdateContextMutation();
  const updatePresentationMutation = useUpdatePresentationMutation();
  const createSlideMutation = useCreateSlideMutation(id ?? null);
  const updateSlideMutation = useUpdateSlideContentMutation(id ?? null);
  const deleteSlideMutation = useDeleteSlideMutation(id ?? null);
  const reorderSlidesMutation = useReorderSlidesMutation(id ?? null);
  const generateSlidesMutation = useGenerateSlidesFromContextMutation(
    id ?? null,
  );
  const activeContextId =
    createdContextId ?? linkedContextQuery.data?.id ?? null;
  const contextFilesQuery = useContextFilesQuery(
    activeContextId,
    Boolean(activeContextId),
  );
  const inviteAccessMutation = useInvitePresentationAccessMutation(id ?? null);

  const slides = useMemo(() => {
    const mappedSlides =
      slidesQuery.data?.map((slide) => ({
        id: slide.id,
        content: slide.content ?? "",
        slideOrder: slide.slideOrder,
      })) ?? [];

    return [...mappedSlides].sort((a, b) => a.slideOrder - b.slideOrder);
  }, [slidesQuery.data]);
  const titleDraft = titleOverride ?? detailQuery.data?.title ?? "";
  const safeSelectedSlideIndex = Math.min(
    selectedSlideIndex,
    Math.max(slides.length - 1, 0),
  );
  const currentSlide = slides[safeSelectedSlideIndex];
  const markdownDraft = currentSlide
    ? (draftById[currentSlide.id] ?? currentSlide.content)
    : "";
  const effectivePromptDraft =
    promptDraft ?? linkedContextQuery.data?.prompt ?? "";

  useEffect(() => {
    if (!slidesQuery.data) {
      return;
    }

    setDraftById((current) => {
      const next = { ...current };
      slidesQuery.data.forEach((slide) => {
        if (next[slide.id] === undefined) {
          next[slide.id] = slide.content ?? "";
        }
      });
      return next;
    });

    setLastSavedById((current) => {
      const next = { ...current };
      slidesQuery.data.forEach((slide) => {
        if (next[slide.id] === undefined) {
          next[slide.id] = slide.content ?? "";
        }
      });
      return next;
    });
  }, [slidesQuery.data]);

  useEffect(() => {
    if (slides.length === 0) {
      setSelectedSlideIndex(0);
      return;
    }

    setSelectedSlideIndex((current) =>
      Math.min(current, Math.max(slides.length - 1, 0)),
    );
  }, [slides.length]);

  useEffect(() => {
    return () => {
      Object.values(autosaveTimersRef.current).forEach((timer) => {
        window.clearTimeout(timer);
      });
      if (savedTimerRef.current) {
        window.clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const showSavedNotice = () => {
    setIsSavedVisible(true);
    if (savedTimerRef.current) {
      window.clearTimeout(savedTimerRef.current);
    }
    savedTimerRef.current = window.setTimeout(() => {
      setIsSavedVisible(false);
    }, 1500);
  };

  const saveSlideContent = async (
    slideId: string,
    content: string,
    { showNotice }: { showNotice: boolean },
  ) => {
    if (lastSavedById[slideId] === content) {
      return;
    }
    if (savingSlidesRef.current.has(slideId)) {
      return;
    }

    savingSlidesRef.current.add(slideId);
    setEditorError(null);

    try {
      await updateSlideMutation.mutateAsync({
        slideId,
        content,
      });
      setLastSavedById((current) => ({
        ...current,
        [slideId]: content,
      }));
      if (showNotice) {
        showSavedNotice();
      }
    } catch (error) {
      setEditorError(
        error instanceof Error ? error.message : "Failed to save slide",
      );
    } finally {
      savingSlidesRef.current.delete(slideId);
    }
  };

  const scheduleAutosave = (slideId: string, content: string) => {
    const existingTimer = autosaveTimersRef.current[slideId];
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    autosaveTimersRef.current[slideId] = window.setTimeout(() => {
      void saveSlideContent(slideId, content, { showNotice: true });
    }, 1200);
  };

  const onAddSlide = async () => {
    try {
      const createdSlide = await createSlideMutation.mutateAsync({
        content: "# New Slide",
        slideOrder: slides.length + 1,
      });

      setDraftById((current) => ({
        ...current,
        [createdSlide.id]: createdSlide.content ?? "",
      }));
      setLastSavedById((current) => ({
        ...current,
        [createdSlide.id]: createdSlide.content ?? "",
      }));
      setSelectedSlideIndex(slides.length);
    } catch (error) {
      setEditorError(
        error instanceof Error ? error.message : "Failed to add slide",
      );
    }
  };

  const onDeleteSlide = async () => {
    if (!currentSlide) {
      return;
    }

    const deletingIndex = safeSelectedSlideIndex;

    try {
      await deleteSlideMutation.mutateAsync(currentSlide.id);
      setDraftById((current) => {
        const next = { ...current };
        delete next[currentSlide.id];
        return next;
      });
      setLastSavedById((current) => {
        const next = { ...current };
        delete next[currentSlide.id];
        return next;
      });
      setSelectedSlideIndex(Math.max(deletingIndex - 1, 0));
    } catch (error) {
      setEditorError(
        error instanceof Error ? error.message : "Failed to delete slide",
      );
    }
  };

  const handleDragStart =
    (slideId: string) => (event: DragEvent<HTMLButtonElement>) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", slideId);
      setDraggingSlideId(slideId);
    };

  const handleDragEnd = () => {
    setDraggingSlideId(null);
    setDragOverSlideId(null);
  };

  const onDropSlide = async (targetId: string) => {
    if (!draggingSlideId || draggingSlideId === targetId) {
      return;
    }

    const draggedIndex = slides.findIndex(
      (slide) => slide.id === draggingSlideId,
    );
    const targetIndex = slides.findIndex((slide) => slide.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    const draggedSlide = slides[draggedIndex];
    const targetSlide = slides[targetIndex];
    const selectedId = currentSlide?.id ?? null;

    try {
      await reorderSlidesMutation.mutateAsync({
        first: [
          { id: draggedSlide.id, order: draggedSlide.slideOrder },
          { id: targetSlide.id, order: targetSlide.slideOrder },
        ],
        second: [
          { id: draggedSlide.id, order: targetSlide.slideOrder },
          { id: targetSlide.id, order: draggedSlide.slideOrder },
        ],
      });

      if (selectedId) {
        const nextSlides = [...slides];
        nextSlides[draggedIndex] = targetSlide;
        nextSlides[targetIndex] = draggedSlide;
        const nextIndex = nextSlides.findIndex(
          (slide) => slide.id === selectedId,
        );
        if (nextIndex >= 0) {
          setSelectedSlideIndex(nextIndex);
        }
      }
    } catch (error) {
      setEditorError(
        error instanceof Error ? error.message : "Failed to reorder slides",
      );
    } finally {
      setDraggingSlideId(null);
      setDragOverSlideId(null);
    }
  };

  const onSaveSelectedSlide = useCallback(async () => {
    if (!currentSlide) {
      return;
    }

    const pendingTimer = autosaveTimersRef.current[currentSlide.id];
    if (pendingTimer) {
      window.clearTimeout(pendingTimer);
    }

    await saveSlideContent(currentSlide.id, markdownDraft, {
      showNotice: true,
    });

    if (!id) {
      return;
    }

    const normalizedTitle = titleDraft.trim();
    if (
      normalizedTitle &&
      normalizedTitle !== (detailQuery.data?.title ?? "")
    ) {
      await updatePresentationMutation
        .mutateAsync({
          presentationId: id,
          title: normalizedTitle,
        })
        .catch(() => undefined);
    }
  }, [
    currentSlide,
    detailQuery.data?.title,
    id,
    markdownDraft,
    titleDraft,
    updatePresentationMutation,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void onSaveSelectedSlide();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSaveSelectedSlide]);

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

  const onGenerateSlides = async () => {
    if (!activeContextId) {
      return;
    }

    setEditorError(null);

    try {
      await generateSlidesMutation.mutateAsync({
        contextId: activeContextId,
      });
      setDraftById({});
      setLastSavedById({});
      setSelectedSlideIndex(0);
    } catch (error) {
      setEditorError(
        error instanceof Error ? error.message : "Failed to generate slides",
      );
    }
  };

  const mutationError =
    createContextMutation.error ?? updateContextMutation.error;

  if (detailQuery.isPending || slidesQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading editor...
        </div>
      </main>
    );
  }

  if (detailQuery.isError || slidesQuery.isError || !detailQuery.data) {
    const error = detailQuery.error ?? slidesQuery.error;
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Failed to open editor</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Unknown error"}
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
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2Icon className="mr-1 size-4" /> Share
            </Button>
          </div>
        </div>
        {editorError ? (
          <p className="mt-1 text-xs text-destructive">{editorError}</p>
        ) : null}
      </header>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-background">
            <div className="border-b border-border px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                Slides
              </p>
            </div>
            <div className="space-y-1 p-2" role="tablist" aria-label="Slides">
              {generateSlidesMutation.isPending ? (
                <div className="flex min-h-[120px] items-center justify-center">
                  <span className="animate-pulse text-xs text-muted-foreground opacity-80">
                    Generating slides...
                  </span>
                </div>
              ) : slides.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No slides yet
                </p>
              ) : (
                slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`flex h-10 items-center gap-2 rounded px-2 text-sm text-foreground transition ${
                      draggingSlideId === slide.id
                        ? "bg-muted shadow-[var(--shadow-subtle-2)]"
                        : index === safeSelectedSlideIndex
                          ? "bg-muted"
                          : "hover:bg-muted/60"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (dragOverSlideId !== slide.id) {
                        setDragOverSlideId(slide.id);
                      }
                    }}
                    onDrop={() => void onDropSlide(slide.id)}
                    onDragLeave={() => {
                      if (dragOverSlideId === slide.id) {
                        setDragOverSlideId(null);
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSlideIndex(index);
                      }}
                      className="flex h-8 flex-1 items-center rounded px-1 text-left"
                      aria-selected={index === safeSelectedSlideIndex}
                      role="tab"
                    >
                      <span>Slide {index + 1}</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-7 items-center justify-center rounded-[12px] border border-border bg-transparent px-2 text-muted-foreground"
                      draggable
                      onDragStart={handleDragStart(slide.id)}
                      onDragEnd={handleDragEnd}
                      aria-label={`Reorder slide ${index + 1}`}
                    >
                      <GripVerticalIcon className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

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
                <Button
                  type="button"
                  onClick={onGenerateSlides}
                  disabled={
                    !activeContextId || generateSlidesMutation.isPending
                  }
                  className="h-9 rounded-full border border-border bg-primary px-4 py-0 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generateSlidesMutation.isPending
                    ? "Generating..."
                    : "Generate slides"}
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
              <CardTitle className="text-base">Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Adjust the slide canvas theme without changing the editor UI.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggle />
                <ThemeDropdown />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Invite collaborators from the Share action in the toolbar.
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

        <section className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background px-4 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onAddSlide}
              >
                <PlusIcon className="mr-1 size-4" /> Add slide
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onDeleteSlide}
                disabled={!currentSlide || deleteSlideMutation.isPending}
              >
                <Trash2Icon className="mr-1 size-4" /> Delete slide
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onSaveSelectedSlide}
                disabled={!currentSlide || updateSlideMutation.isPending}
              >
                {updateSlideMutation.isPending ? (
                  <Spinner className="mr-1 size-4" />
                ) : (
                  <SaveIcon className="mr-1 size-4" />
                )}
                Save
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isSavedVisible ? (
                <span className="text-xs text-muted-foreground">Saved</span>
              ) : null}
            </div>
          </div>

          <div
            className={`grid gap-4 ${isPreviewVisible ? "lg:grid-cols-2" : ""}`}
          >
            <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-subtle-7)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  Markdown editor
                </h2>
              </div>
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
                    setDraftById((current) => ({
                      ...current,
                      [currentSlide.id]: nextValue,
                    }));
                    scheduleAutosave(currentSlide.id, nextValue);
                  }}
                  rows={20}
                  className="min-h-[480px] resize-none border-0 bg-transparent p-0 text-sm text-foreground shadow-none focus-visible:ring-0"
                  aria-label="Markdown editor"
                />
              )}
            </div>

            {isPreviewVisible ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <SlideThemeBoundary className="min-h-[400px] rounded border p-4">
                    <div className="prose prose-neutral max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdownDraft}
                      </ReactMarkdown>
                    </div>
                  </SlideThemeBoundary>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Presentation</DialogTitle>
            <DialogDescription>
              Invite collaborators with edit access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
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
