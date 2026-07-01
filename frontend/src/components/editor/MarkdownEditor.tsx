"use client";

import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface MarkdownEditorProps {
  markdownDraft: string;
  hasSlides: boolean;
  isSavedVisible: boolean;
  isSaving: boolean;
  onMarkdownChange: (value: string) => void;
  onSave: () => void;
}

export function MarkdownEditor({
  markdownDraft,
  hasSlides,
  isSavedVisible,
  isSaving,
  onMarkdownChange,
  onSave,
}: MarkdownEditorProps) {
  return (
    <>
      <div className="flex h-10 w-full flex-shrink-0 items-center justify-between gap-2 rounded-2xl border border-border bg-background px-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSave}
            disabled={!hasSlides || isSaving}
            className="flex h-8 items-center gap-1 rounded px-3 text-sm hover:bg-muted disabled:opacity-50"
          >
            {isSaving ? (
              <Spinner className="mr-1 size-4" />
            ) : null}
            Save
          </button>
        </div>
        <div className="flex items-center gap-2">
          {isSavedVisible ? (
            <span className="text-xs text-muted-foreground">Saved</span>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl bg-white px-4 pb-4 pt-2 shadow-[var(--shadow-subtle-7)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Markdown editor</h2>
        </div>
        {!hasSlides ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No slides found</EmptyTitle>
              <EmptyDescription>
                This presentation currently has no slides to edit.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Textarea
            value={markdownDraft}
            onChange={(event) => onMarkdownChange(event.target.value)}
            className="h-[400px] w-full resize-none font-mono text-sm"
            aria-label="Slide markdown content"
            spellCheck={false}
          />
        )}
      </div>
    </>
  );
}