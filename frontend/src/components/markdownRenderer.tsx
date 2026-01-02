import { useEffect, useLayoutEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info, Terminal } from "lucide-react";

export function MarkdownRenderer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeText = () => {
    const Container = containerRef.current;
    if (!Container || !Container.parentElement) return;
    let contentHeight = Container.scrollHeight;
    const parentHeight = Container.parentElement.clientHeight * 0.9;
    if (parentHeight === 0) return;
    let l = 1;
    let r = 200;
    let best = l;
    let mid = (l + r) / 2;
    let iterations = 0;
    while (l < r && iterations < 20) {
      mid = (l + r) / 2;
      Container.style.fontSize = `${mid}px`;
      contentHeight = Container.scrollHeight;
      if (contentHeight > parentHeight) {
        r = mid;
      } else {
        best = mid;
        l = mid;
      }
      iterations++;
    }
    Container.style.fontSize = `${best}px`;
    /* let scaleFactor = 1;
     scaleFactor = parentHeight / contentHeight;
     Container.style.transform = `scale(${scaleFactor})`;
     Container.style.transformOrigin = "top left";
     Container.style.width = `${100 / scaleFactor}%`; */
  };
  useLayoutEffect(() => {
    resizeText();
  }, [content]);

  useEffect(() => {
    if (containerRef.current && containerRef.current.parentElement) {
      const resizeObserver = new ResizeObserver(() => {
        resizeText();
      });
      resizeObserver.observe(containerRef.current.parentElement);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div className="flex items-center justify-center overflow-hidden h-screen bg-background p-8">
      <Card className="w-full shadow-2xl overflow-hidden border-border bg-card text-card-foreground p-12 h-[95vh]  ">
        <div ref={containerRef}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // --- 1. HEADINGS (Typography & Slide Structure) ---
              h1: ({ ...props }) => (
                <div className="mb-2 border-b border-border pb-2 ">
                  <h1
                    className="text-[50px] font-extrabold tracking-tight lg:text-[3em] text-primary"
                    {...props}
                  />
                </div>
              ),
              h2: ({ ...props }) => (
                // CHANGE 4: Use Chart colors for distinctive accent borders
                <h2
                  className="mt-4 mb-2 text-[min(1.5em,35px)] font-bold tracking-tight text-foreground border-l-8 border-chart-2 pl-4 py-1 bg-secondary/20 rounded-r-lg"
                  {...props}
                />
              ),
              h3: ({ ...props }) => (
                <h3
                  className=" mb-2 text-[min(1.25em,30px)] font-semibold text-foreground"
                  {...props}
                />
              ),

              // --- 2. PARAGRAPHS & TEXT ---
              p: ({ ...props }) => (
                <p
                  className="leading-[1.75] text-[min(1em,24px)] text-muted-foreground"
                  {...props}
                />
              ),
              strong: ({ ...props }) => (
                // CHANGE 5: Make bold text pop with Accent color
                <span className="font-extrabold text-foreground  " {...props} />
              ),
              // --- 3. LISTS (Styling with custom markers) ---
              ul: ({ ...props }) => (
                // CHANGE 6: Colorful Bullets using 'marker' utility
                <ul
                  className="my-3 ml-6 list-disc [&>li]:mt-2 marker:text-chart-4 marker:text-[min(1.25em,30px)] text-foreground/90"
                  {...props}
                />
              ),
              li: ({ children, ...props }) => {
                return (
                  <li {...props} className="pl-1">
                    {children}
                  </li>
                );
              },
              blockquote: ({ ...props }) => (
                <div className="my-4 transform hover:scale-[1.01] transition-transform duration-300 ">
                  <Alert className="bg-accent/10 border-l-4 border-l-accent border-y-0 border-r-0 rounded-[var(--radius)] text-foreground shadow-sm">
                    <Info className="h-5 w-5 text-foreground" />
                    <AlertTitle className="text-foreground font-bold uppercase tracking-wider text-[min(0.75em,18px)] ml-2">
                      Insight
                    </AlertTitle>
                    <AlertDescription className="mt-2 pl-2 text-foreground font-semibold italic text-[min(1.125em,26px)]">
                      {props.children}
                    </AlertDescription>
                  </Alert>
                </div>
              ),

              // --- 6. TABLES -> SHADCN TABLE COMPONENTS ---

              table: ({ ...props }) => (
                // Container: White background, light grey border
                <div className="my-4 rounded-md border border-primary overflow-hidden bg-card shadow-sm">
                  <Table {...props} />
                </div>
              ),
              thead: ({ ...props }) => (
                // Header background: Very light grey to distinguish from body
                <TableHeader className="bg-muted/50" {...props} />
              ),
              tr: ({ ...props }) => (
                // Row hover: Light grey interaction
                <TableRow
                  className="hover:bg-muted/50 border-b border-border"
                  {...props}
                />
              ),
              th: ({ ...props }) => (
                // Header text: Dark black/grey, bold
                <TableHead className="text-foreground font-bold" {...props} />
              ),
              td: ({ ...props }) => (
                // Cell text: Slightly softer grey for readability
                <TableCell className="text-muted-foreground" {...props} />
              ),

              // --- 7. LINKS -> BUTTONS / HOVERCARDS ---
              a: ({ href, children, ...props }) => (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="link"
                      className="text-primary h-auto p-0 underline"
                      asChild
                    >
                      <a href={href} {...props}>
                        {children}
                      </a>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-card border-border text-card-foreground">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarFallback>🔗</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-[min(0.875em,20px)] font-semibold">
                          External Link
                        </h4>
                        <p className="text-[min(0.875em,20px)] text-muted-foreground">
                          Navigates to:{" "}
                          <span className="text-primary">{href}</span>
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ),

              // --- 8. IMAGES -> CARD WITH CAPTION ---
              img: ({ ...props }) => (
                <div className="my-4">
                  <Card className="overflow-hidden border-border bg-muted">
                    <AspectRatio ratio={16 / 5}>
                      <img
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        src={props.src}
                        alt={props.alt}
                      />
                    </AspectRatio>
                    <CardFooter className="py-2 text-[min(0.75em,18px)] text-muted-foreground bg-muted/50 justify-center">
                      Image: {props.alt}
                    </CardFooter>
                  </Card>
                </div>
              ),

              // --- 9. HORIZONTAL RULE -> SEPARATOR ---
              hr: ({ ...props }) => (
                <Separator className="my-4 bg-border" {...props} />
              ),
              code: ({ inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <div className="my-4 rounded-lg border border-border overflow-hidden bg-white">
                    <div className="bg-primary px-4 py-2 text-[min(0.75em,18px)] font-mono text-white border-b border-border flex items-center gap-2">
                      <Terminal className="w-3 h-3" /> {match[1]}
                    </div>
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        background: "transparent",
                        fontSize: "min(0.75em, 24px)",
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/30 mx-1 font-mono text-[min(0.7em,18px)] font-extrabold"
                  >
                    {children}
                  </Badge>
                );
              },
              // --- 10. CHECKBOX (GFM TASK LISTS) ---
              input: ({ ...props }) => {
                if (props.type === "checkbox") {
                  return (
                    <Checkbox
                      checked={props.checked}
                      disabled
                      className="mr-2 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  );
                }
                return <input {...props} />;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
}
