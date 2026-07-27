import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEditorState } from "@/components/editor/useEditorState";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { SlideList } from "@/components/editor/SlideList";
import { EditorToolbar } from "@/components/editor/EditorToolbarActions";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { LivePreview } from "@/components/editor/LivePreview";
import { SidebarContext } from "@/components/editor/SidebarContext";
import { SidebarTheme } from "@/components/editor/SidebarTheme";
import { ShareDialog } from "@/components/dialogs/ShareDialog";

export function PresentationEditorPage() {
  const state = useEditorState();

  if (state.detailQuery.isPending || state.slidesQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading editor...
        </div>
      </main>
    );
  }

  if (state.detailQuery.isError || state.slidesQuery.isError || !state.detailQuery.data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
        <p className="text-sm text-muted-foreground">Failed to open editor.</p>
        <Button className="mt-4" asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    );
  }

  if (!state.detailQuery.data.capabilities.editContent) {
    return (
      <Navigate
        to={`/presentations/${state.detailQuery.data.id}`}
        replace
      />
    );
  }

  const {
    detailQuery,
    slides,
    currentSlide,
    markdownDraft,
    titleDraft,
    safeSelectedSlideIndex,
    isPreviewVisible,
    isSavedVisible,
    pendingFiles,
    isShareDialogOpen,
    draggingSlideId,
    dragOverSlideId,
    numSlides,
    activeContextId,
    effectivePromptDraft,
    contextFilesQuery,
    updateContextMutation,
    updateSlideMutation,
    deleteSlideMutation,
    generateSlidesMutation,
    setTitleOverride,
    setIsPreviewVisible,
    setIsShareDialogOpen,
    setNumSlides,
    setPromptDraft,
    setSelectedSlideIndex,
    onAddSlide,
    onDeleteSlide,
    handleDragStart,
    handleDragEnd,
    onDropSlide,
    onSaveSelectedSlide,
    onSaveContext,
    onPickFiles,
    onGenerateSlides,
    onMarkdownChange,
  } = state;

  return (
    <main
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6"
      aria-label="Presentation editor"
    >
      <EditorHeader
        presentationId={detailQuery.data.id}
        titleDraft={titleDraft}
        isPreviewVisible={isPreviewVisible}
        canManageAccess={detailQuery.data.capabilities.manageAccess}
        onTitleChange={setTitleOverride}
        onTogglePreview={() => setIsPreviewVisible((current) => !current)}
        onOpenShare={() => setIsShareDialogOpen(true)}
      />

      <div className="grid flex-1 gap-4 overflow-hidden xl:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-4 overflow-y-auto">
          <SlideList
            slides={slides}
            selectedSlideIndex={safeSelectedSlideIndex}
            draggingSlideId={draggingSlideId}
            dragOverSlideId={dragOverSlideId}
            isGenerating={generateSlidesMutation.isPending}
            onSelectSlide={setSelectedSlideIndex}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDropSlide={onDropSlide}
            onDragOver={() => {}}
            onDragLeave={() => {}}
          />

          <div className="flex flex-col gap-3">
            <SidebarContext
              activeContextId={activeContextId}
              effectivePromptDraft={effectivePromptDraft}
              pendingFiles={pendingFiles}
              contextFiles={contextFilesQuery.data}
              isUpdating={updateContextMutation.isPending}
              isGenerating={generateSlidesMutation.isPending}
              numSlides={numSlides}
              onPromptChange={setPromptDraft}
              onPickFiles={onPickFiles}
              onRemovePendingFile={(file) => state.setPendingFiles((current) => current.filter((c) => c !== file))}
              onMarkFileForDeletion={(fileId) => state.setDeletedFileIds((current) => [...current, fileId])}
              onSaveContext={onSaveContext}
              onGenerateSlides={onGenerateSlides}
              onNumSlidesChange={setNumSlides}
            />

            <SidebarTheme />
          </div>
        </aside>

        <section className="flex min-h-0 flex-col gap-4">
          <EditorToolbar
            hasCurrentSlide={!!currentSlide}
            isDeleting={deleteSlideMutation.isPending}
            isSaving={updateSlideMutation.isPending}
            isSavedVisible={isSavedVisible}
            onAddSlide={onAddSlide}
            onDeleteSlide={onDeleteSlide}
            onSave={onSaveSelectedSlide}
          />

          <MarkdownEditor
            markdownDraft={markdownDraft}
            hasSlides={slides.length > 0}
            onMarkdownChange={onMarkdownChange}
          />

          <LivePreview content={markdownDraft} visible={isPreviewVisible} />
        </section>
      </div>

      <ShareDialog
        presentationId={detailQuery.data.id}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </main>
  );
}
