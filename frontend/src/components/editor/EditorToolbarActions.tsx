"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface EditorToolbarProps {
  hasCurrentSlide: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  isSavedVisible: boolean;
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onSave: () => void;
}

export function EditorToolbar({
  hasCurrentSlide,
  isDeleting,
  isSaving,
  isSavedVisible,
  onAddSlide,
  onDeleteSlide,
  onSave,
}: EditorToolbarProps) {
  return (
    <div className="flex h-10 w-full flex-shrink-0 items-center justify-between gap-2 rounded-2xl border border-border bg-background px-4">
      <div className="flex items-center gap-1">
        <Button type="button" size="sm" variant="ghost" onClick={onAddSlide} className="h-8 px-3">
          <PlusIcon className="mr-1 size-4" /> Add slide
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDeleteSlide} disabled={!hasCurrentSlide || isDeleting} className="h-8 px-3">
          <Trash2Icon className="mr-1 size-4" /> Delete slide
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onSave} disabled={!hasCurrentSlide || isSaving} className="h-8 px-3">
          {isSaving ? <Spinner className="mr-1 size-4" /> : null}
          Save
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {isSavedVisible ? (
          <span className="text-xs text-muted-foreground">Saved</span>
        ) : null}
      </div>
    </div>
  );
}