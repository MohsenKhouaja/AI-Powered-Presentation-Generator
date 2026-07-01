"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SlideNavigationFooterProps {
  slideIndex: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function SlideNavigationFooter({
  slideIndex,
  totalSlides,
  onPrevious,
  onNext,
}: SlideNavigationFooterProps) {
  const progressValue = ((slideIndex + 1) / totalSlides) * 100;

  return (
    <footer className="sticky bottom-0 border-t bg-background/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={slideIndex === 0}
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="min-w-[100px] text-sm text-muted-foreground">
          {slideIndex + 1}/{totalSlides}
        </div>
        <Progress
          value={progressValue}
          className="h-2 min-w-[150px] flex-1"
        />
        <Button
          variant="outline"
          onClick={onNext}
          disabled={slideIndex >= totalSlides - 1}
          aria-label="Next slide"
        >
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </footer>
  );
}