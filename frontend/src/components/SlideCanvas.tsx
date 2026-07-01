"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@/components/markdownRenderer";
import { SlideThemeBoundary } from "@/components/app/SlideThemeBoundary";

interface SlideCanvasProps {
  content: string | null;
  className?: string;
  scaleBaseWidth?: number;
  scaleBaseHeight?: number;
  padding?: string;
}

export function SlideCanvas({
  content = "",
  className,
  scaleBaseWidth = 1280,
  scaleBaseHeight = 720,
  padding = "p-12",
}: SlideCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / scaleBaseWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scaleBaseWidth]);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden rounded border ${className ?? ""}`}
      style={{ paddingBottom: `${(scaleBaseHeight / scaleBaseWidth) * 100}%` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left overflow-hidden"
        style={{
          width: scaleBaseWidth,
          height: scaleBaseHeight,
          transform: `scale(${scale})`,
        }}
      >
        <SlideThemeBoundary className={`h-full w-full ${padding}`}>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <MarkdownRenderer content={content ?? ""} />
          </div>
        </SlideThemeBoundary>
      </div>
    </div>
  );
}