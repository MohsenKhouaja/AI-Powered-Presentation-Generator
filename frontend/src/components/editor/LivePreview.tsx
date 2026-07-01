"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@/components/markdownRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlideThemeBoundary } from "@/components/app/SlideThemeBoundary";

interface LivePreviewProps {
  content: string;
  visible: boolean;
}

export function LivePreview({ content, visible }: LivePreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / 1280);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible]);

  if (!visible) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={wrapperRef}
          className="relative w-full overflow-hidden rounded border aspect-video"
        >
          <div
            className="absolute top-0 left-0 origin-top-left overflow-hidden"
            style={{
              width: 1280,
              height: 720,
              transform: `scale(${scale})`,
            }}
          >
            <SlideThemeBoundary className="h-full w-full p-12">
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                <MarkdownRenderer content={content} />
              </div>
            </SlideThemeBoundary>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}