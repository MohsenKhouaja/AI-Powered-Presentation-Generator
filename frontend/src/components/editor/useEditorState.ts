"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  usePresentationDetailQuery,
  useUpdatePresentationMutation,
} from "@/hooks/queries/usePresentations";
import {
  usePresentationSlidesQuery,
  useCreateSlideMutation,
  useDeleteSlideMutation,
  useReorderSlidesMutation,
  useUpdateSlideContentMutation,
  useGenerateSlidesFromContextMutation,
} from "@/hooks/queries/useSlides";
import {
  useContextByPresentationQuery,
  useContextFilesQuery,
  useCreateContextMutation,
  useUpdateContextMutation,
} from "@/hooks/queries/useContextsFiles";
import { useInvitePresentationAccessMutation } from "@/hooks/queries/useShareReadOnly";

export function useEditorState() {
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
  const [lastSavedById, setLastSavedById] = useState<Record<string, string>>({});
  const [isSavedVisible, setIsSavedVisible] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [deletedFilesNames, setDeletedFilesNames] = useState<string[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [draggingSlideId, setDraggingSlideId] = useState<string | null>(null);
  const [dragOverSlideId, setDragOverSlideId] = useState<string | null>(null);
  const [numSlides, setNumSlides] = useState<string>("");

  const autosaveTimersRef = useRef<Record<string, number>>({});
  const savingSlidesRef = useRef<Set<string>>(new Set());
  const savedTimerRef = useRef<number | null>(null);

  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const createContextMutation = useCreateContextMutation();
  const updateContextMutation = useUpdateContextMutation();
  const updatePresentationMutation = useUpdatePresentationMutation();
  const createSlideMutation = useCreateSlideMutation(id ?? null);
  const updateSlideMutation = useUpdateSlideContentMutation(id ?? null);
  const deleteSlideMutation = useDeleteSlideMutation(id ?? null);
  const reorderSlidesMutation = useReorderSlidesMutation(id ?? null);
  const generateSlidesMutation = useGenerateSlidesFromContextMutation(id ?? null);
  const inviteAccessMutation = useInvitePresentationAccessMutation(id ?? null);

  const activeContextId = createdContextId ?? linkedContextQuery.data?.id ?? null;
  const contextFilesQuery = useContextFilesQuery(activeContextId, Boolean(activeContextId));

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
  const safeSelectedSlideIndex = Math.min(selectedSlideIndex, Math.max(slides.length - 1, 0));
  const currentSlide = slides[safeSelectedSlideIndex];
  const markdownDraft = currentSlide
    ? (draftById[currentSlide.id] ?? currentSlide.content)
    : "";
  const effectivePromptDraft = promptDraft ?? linkedContextQuery.data?.prompt ?? "";

  // Sync slide data into draft/lastSaved state
  useEffect(() => {
    if (!slidesQuery.data) return;
    setDraftById((current) => {
      const next = { ...current };
      slidesQuery.data.forEach((slide) => {
        if (next[slide.id] === undefined) next[slide.id] = slide.content ?? "";
      });
      return next;
    });
    setLastSavedById((current) => {
      const next = { ...current };
      slidesQuery.data.forEach((slide) => {
        if (next[slide.id] === undefined) next[slide.id] = slide.content ?? "";
      });
      return next;
    });
  }, [slidesQuery.data]);

  // Clamp selected slide index
  useEffect(() => {
    if (slides.length === 0) {
      setSelectedSlideIndex(0);
      return;
    }
    setSelectedSlideIndex((current) => Math.min(current, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(autosaveTimersRef.current).forEach((timer) =>
        window.clearTimeout(timer),
      );
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  // ResizeObserver to keep preview scale accurate
  useEffect(() => {
    const el = previewWrapperRef.current;
    if (!el) return;
    const update = () => setPreviewScale(el.offsetWidth / 1280);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isPreviewVisible]);

  const showSavedNotice = () => {
    setIsSavedVisible(true);
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    savedTimerRef.current = window.setTimeout(() => setIsSavedVisible(false), 1500);
  };

  const saveSlideContent = async (slideId: string, content: string, { showNotice }: { showNotice: boolean }) => {
    if (lastSavedById[slideId] === content) return;
    if (savingSlidesRef.current.has(slideId)) return;
    savingSlidesRef.current.add(slideId);
    try {
      await updateSlideMutation.mutateAsync({ slideId, content });
      setLastSavedById((current) => ({ ...current, [slideId]: content }));
      if (showNotice) showSavedNotice();
    } catch {
      // error handled by mutation onError toast
    } finally {
      savingSlidesRef.current.delete(slideId);
    }
  };

  const scheduleAutosave = (slideId: string, content: string) => {
    const existingTimer = autosaveTimersRef.current[slideId];
    if (existingTimer) window.clearTimeout(existingTimer);
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
    } catch {
      // error handled by mutation onError toast
    }
  };

  const onDeleteSlide = async () => {
    if (!currentSlide) return;
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
    } catch {
      // error handled by mutation onError toast
    }
  };

  const handleDragStart = (slideId: string) => (event: React.DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", slideId);
    setDraggingSlideId(slideId);
  };

  const handleDragEnd = () => {
    setDraggingSlideId(null);
    setDragOverSlideId(null);
  };

  const onDropSlide = async (targetId: string) => {
    if (!draggingSlideId || draggingSlideId === targetId) return;
    const draggedIndex = slides.findIndex((slide) => slide.id === draggingSlideId);
    const targetIndex = slides.findIndex((slide) => slide.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
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
        const nextIndex = nextSlides.findIndex((slide) => slide.id === selectedId);
        if (nextIndex >= 0) setSelectedSlideIndex(nextIndex);
      }
    } catch {
      // error handled by mutation onError toast
    } finally {
      setDraggingSlideId(null);
      setDragOverSlideId(null);
    }
  };

  const onSaveSelectedSlide = useCallback(async () => {
    if (!currentSlide) return;
    const pendingTimer = autosaveTimersRef.current[currentSlide.id];
    if (pendingTimer) window.clearTimeout(pendingTimer);
    await saveSlideContent(currentSlide.id, markdownDraft, { showNotice: true });
    if (!id) return;
    const normalizedTitle = titleDraft.trim();
    if (normalizedTitle && normalizedTitle !== (detailQuery.data?.title ?? "")) {
      await updatePresentationMutation
        .mutateAsync({ presentationId: id, title: normalizedTitle })
        .catch(() => undefined);
    }
  }, [currentSlide, detailQuery.data?.title, id, markdownDraft, titleDraft, updatePresentationMutation]);

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

  const onInviteAccess = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    const expiresAtIso = inviteExpiresAt ? new Date(inviteExpiresAt).toISOString() : null;
    await inviteAccessMutation.mutateAsync({ email, expiresAt: expiresAtIso });
    setInviteEmail("");
    setInviteExpiresAt("");
  };

  const onPickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setPendingFiles((current) => [...current, ...nextFiles]);
    event.target.value = "";
  };

  const onSaveContext = async (event: React.FormEvent) => {
    event.preventDefault();
    if (activeContextId) {
      await updateContextMutation
        .mutateAsync({
          contextId: activeContextId,
          prompt: effectivePromptDraft,
          files: pendingFiles,
          deletedFilesNames,
        })
        .catch(() => undefined);
    } else {
      const result = await createContextMutation
        .mutateAsync({
          prompt: effectivePromptDraft,
          presentationId: id,
          files: pendingFiles,
        })
        .catch(() => null);
      if (result?.context.id) setCreatedContextId(result.context.id);
    }
    setPendingFiles([]);
    setDeletedFilesNames([]);
  };

  const onGenerateSlides = async () => {
    if (!activeContextId) return;
    const parsed = numSlides.trim() !== "" ? Number(numSlides) : undefined;
    try {
      await generateSlidesMutation.mutateAsync({
        contextId: activeContextId,
        numSlides: parsed,
      });
      setDraftById({});
      setLastSavedById({});
      setSelectedSlideIndex(0);
    } catch {
      // error handled by mutation onError toast
    }
  };

  const onMarkdownChange = (next: string) => {
    if (!currentSlide) return;
    setDraftById((current) => ({
      ...current,
      [currentSlide.id]: next,
    }));
    scheduleAutosave(currentSlide.id, next);
  };

  return {
    // Data
    id,
    detailQuery,
    slidesQuery,
    slides,
    currentSlide,
    markdownDraft,
    titleDraft,
    safeSelectedSlideIndex,
    isPreviewVisible,
    isSavedVisible,
    previewWrapperRef,
    previewScale,
    pendingFiles,
    deletedFilesNames,
    isShareDialogOpen,
    inviteEmail,
    inviteExpiresAt,
    draggingSlideId,
    dragOverSlideId,
    numSlides,
    activeContextId,
    effectivePromptDraft,
    linkedContextQuery,
    contextFilesQuery,

    // Mutations
    createContextMutation,
    updateContextMutation,
    updatePresentationMutation,
    createSlideMutation,
    updateSlideMutation,
    deleteSlideMutation,
    reorderSlidesMutation,
    generateSlidesMutation,
    inviteAccessMutation,

    // Actions
    setTitleOverride,
    setIsPreviewVisible,
    setIsShareDialogOpen,
    setInviteEmail,
    setInviteExpiresAt,
    setNumSlides,
    setPromptDraft,
    setPendingFiles,
    setDeletedFilesNames,
    setSelectedSlideIndex,

    onAddSlide,
    onDeleteSlide,
    handleDragStart,
    handleDragEnd,
    onDropSlide,
    onSaveSelectedSlide,
    onSaveContext,
    onInviteAccess,
    onPickFiles,
    onGenerateSlides,
    onMarkdownChange,
  };
}