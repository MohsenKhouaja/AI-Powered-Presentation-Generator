"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, SaveIcon } from "lucide-react";

interface SidebarContextProps {
  activeContextId: string | null;
  effectivePromptDraft: string;
  pendingFiles: File[];
  contextFiles: { id: string; originalName: string; fileName: string }[] | undefined;
  isCreating: boolean;
  isUpdating: boolean;
  isGenerating: boolean;
  numSlides: string;
  mutationError: Error | null;
  onPromptChange: (value: string) => void;
  onPickFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePendingFile: (file: File) => void;
  onMarkFileForDeletion: (fileName: string) => void;
  onSaveContext: (event: React.FormEvent) => void;
  onGenerateSlides: () => void;
  onNumSlidesChange: (value: string) => void;
}

export function SidebarContext({
  activeContextId,
  effectivePromptDraft,
  pendingFiles,
  contextFiles,
  isCreating,
  isUpdating,
  isGenerating,
  numSlides,
  mutationError,
  onPromptChange,
  onPickFiles,
  onRemovePendingFile,
  onMarkFileForDeletion,
  onSaveContext,
  onGenerateSlides,
  onNumSlidesChange,
}: SidebarContextProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium">Context</h3>
      <form onSubmit={onSaveContext} className="space-y-3">
        <Textarea
          value={effectivePromptDraft}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Add prompt context for AI generation"
          rows={6}
          aria-label="Context prompt"
          className="max-h-64 overflow-y-auto resize-y"
        />
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="context-files">Files</label>
          <Input id="context-files" type="file" multiple onChange={onPickFiles} aria-describedby="context-files-help" />
          <p id="context-files-help" className="text-xs text-muted-foreground">PDF, DOCX, TXT, MD, PNG, JPG</p>
        </div>
        <div className="space-y-2">
          {contextFiles?.map((file) => (
            <div key={file.id} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
              <span className="line-clamp-1">{file.originalName}</span>
              <Button size="icon" variant="ghost" type="button" onClick={() => onMarkFileForDeletion(file.fileName)} aria-label={`Mark ${file.originalName} for deletion`}>
                <XIcon className="size-3" />
              </Button>
            </div>
          ))}
          {pendingFiles.map((file) => (
            <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
              <span className="line-clamp-1">{file.name}</span>
              <Button size="icon" variant="ghost" type="button" onClick={() => onRemovePendingFile(file)} aria-label={`Remove ${file.name}`}>
                <XIcon className="size-3" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="submit" className="w-full" disabled={isCreating || isUpdating}>
          {isCreating || isUpdating ? <Spinner className="mr-2" /> : <SaveIcon className="mr-2 size-4" />}
          Save Context
        </Button>
        <div className="flex items-center gap-2">
          <Input
            type="number" min={1} max={50} placeholder="Slides (auto)" value={numSlides}
            onChange={(e) => onNumSlidesChange(e.target.value)}
            className="h-9 w-28 rounded-full border-border text-sm"
          />
          <Button
            type="button" onClick={onGenerateSlides}
            disabled={!activeContextId || isGenerating}
            className="h-9 rounded-full border border-border bg-primary px-4 py-0 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate slides"}
          </Button>
        </div>
      </form>
      {mutationError ? (
        <Alert variant="destructive" className="mt-3">
          <AlertCircleIcon />
          <AlertTitle>Context save failed</AlertTitle>
          <AlertDescription>{mutationError instanceof Error ? mutationError.message : "Unknown error"}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}