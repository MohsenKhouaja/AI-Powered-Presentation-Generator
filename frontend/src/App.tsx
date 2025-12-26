/* import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

function Title(props: { title: string }) {
  return <h1 className="text-4xl font-bold text-primary">{props.title}</h1>;
}
function Content(props: { text: string }) {
  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown>{props.text}</ReactMarkdown>
    </div>
  );
}
interface Slide {
  id: number;
  title: string;
  content: string;
}
function SlideView(props: { slide: Slide }) {
  return (
    <div className="p-8  rounded-lg shadow-lg h-full w-full text-white flex flex-1 flex-col ">
      <div className="mb-8">
        <Title title={props.slide.title}></Title>
      </div>
      <div>
        <Content text={props.slide.content}></Content>
      </div>
    </div>
  );
}
function Presentation(props: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setI((current) => Math.max(0, current - 1));
      } else if (e.key === "ArrowRight") {
        setI((current) => Math.min(props.slides.length - 1, current + 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [props.slides]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 w-full h-full">
      <SlideView slide={props.slides[i]}></SlideView>
    </div>
  );
}
function App() {
  const [presentation, setPresentation] = useState<Slide[]>([
    {
      id: 1,
      title: "PantryPal: Revolutionizing Food Management",
      content:
        "Welcome to **PantryPal**, an application designed to make managing your groceries and meals effortless and magical.\n\nOur core mission is to leverage **Artificial Intelligence** to transform everyday kitchen tasks:\n\n*   **Simplify inventory tracking**\n*   **Generate personalized meal ideas**\n*   **Provide proactive insights** to reduce food waste\n\nThis presentation will walk you through PantryPal's complete functionalities, highlighting the AI enhancements that power each feature.",
    },
  ]);
useEffect(() => {
    console.log("Fetching presentation data...");
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:3001/");
        console.log("Response status:", response.status);
        const data: Slide[] = await response.json();
        console.log("Fetched data:", data);
        console.log("Number of slides:", data.length);
        setPresentation(data);
      } catch (error) {
        console.error("Error fetching presentation:", error);
      }
    }
    fetchData();
  }, []); 
 return (
    <>
      <Presentation slides={presentation}></Presentation>
    </>
  );
}

export default App;
 */

import React, { useLayoutEffect, useRef } from "react";
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

const SLIDE_CONTENT_MARKDOWN_1 = `
# Q4 Project Overview
## System Architecture & Deliverables

> **Note:** This is a critical update for the engineering team. Please review the architecture changes below.

### 1. Core Objectives
Here is a breakdown of our current status compared to the previous quarter.

| Metric | Q3 (Actual) | Q4 (Target) | Status |
| :--- | :--- | :--- | :--- |
| **Uptime** | 99.2% | 99.9% | ✅ On Track |
| Latency | 120ms | 45ms | ⚠️ At Risk |
| Users | 15k | 50k | 🚀 Exceeded |

### 2. Implementation Plan
We are moving to a new **Rust-based** microservice architecture.

- [x] Audit current Node.js services
- [x] Define API Schema (OpenAPI 3.0)
- [ ] Migrate User Auth Service
- [ ] Deprecate Legacy Database

### 3. Code Snippet: API Gateway
Here is how the new gateway config looks:
 `;

export default function MarkdownRenderer() {
  const containerRef = useRef(null);
  useLayoutEffect(() => {
    const Container = containerRef.current;
    if (!Container) return;
    const contentHeight = Container.scrollHeight;
    const parentHeight = Container.parentElement.clientHeight * 0.9;
    if (parentHeight == 0) return;
    /* 
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
    Container.style.fontSize = `${best}px`; */
    let scaleFactor = 1;
    scaleFactor = parentHeight / contentHeight;
    Container.style.transform = `scale(${scaleFactor})`;
    Container.style.transformOrigin = "top left";
    Container.style.width = `${100 / scaleFactor}%`;
  }, [SLIDE_CONTENT_MARKDOWN_1]);
  

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
                    className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary"
                    {...props}
                  />
                </div>
              ),
              h2: ({ ...props }) => (
                // CHANGE 4: Use Chart colors for distinctive accent borders
                <h2
                  className="mt-4 mb-2 text-2xl font-bold tracking-tight text-foreground border-l-8 border-chart-2 pl-4 py-1 bg-secondary/20 rounded-r-lg"
                  {...props}
                />
              ),
              h3: ({ ...props }) => (
                <h3
                  className=" mb-2 text-xl font-semibold text-foreground"
                  {...props}
                />
              ),

              // --- 2. PARAGRAPHS & TEXT ---
              p: ({ ...props }) => (
                <p className="leading-7  text-muted-foreground" {...props} />
              ),
              strong: ({ ...props }) => (
                // CHANGE 5: Make bold text pop with Accent color
                <span className="font-extrabold text-foreground" {...props} />
              ),
              // --- 3. LISTS (Styling with custom markers) ---
              ul: ({ ...props }) => (
                // CHANGE 6: Colorful Bullets using 'marker' utility
                <ul
                  className="my-3 ml-6 list-disc [&>li]:mt-2 marker:text-chart-4 marker:text-xl text-foreground/90"
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
                    <AlertTitle className="text-foreground font-bold uppercase tracking-wider text-xs ml-2">
                      Insight
                    </AlertTitle>
                    <AlertDescription className="mt-2 pl-2 text-foreground font-semibold italic text-lg">
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
                        <h4 className="text-sm font-semibold">External Link</h4>
                        <p className="text-sm text-muted-foreground">
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
                    <CardFooter className="py-2 text-xs text-muted-foreground bg-muted/50 justify-center">
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
                    <div className="bg-primary px-4 py-2 text-xs font-mono text-white border-b border-border flex items-center gap-2">
                      <Terminal className="w-3 h-3" /> {match[1]}
                    </div>
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, background: "transparent" }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/30 mx-1 font-mono"
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
            {SLIDE_CONTENT_MARKDOWN_1}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
}
