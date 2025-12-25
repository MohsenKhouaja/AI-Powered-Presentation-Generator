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
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // REQUIRED: npm install remark-gfm

// --- Shadcn UI Imports (Assuming standard installation paths) ---
import { Card, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

// --- The "Kitchen Sink" Markdown Text ---
const SLIDE_CONTENT_MARKDOWN = `
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

\`\`\`json
{
  "service": "api-gateway",
  "version": "2.0.0",
  "routes": {
    "/auth": "service-auth:8080",
    "/payments": "service-payments:3000"
  }
}
\`\`\`

---

Review full documentation at [Internal Wiki](https://wiki.internal.company).

![System Diagram](https://images.unsplash.com/photo-1558494949-ef526b0042a0?w=800&auto=format&fit=crop&q=60)
`;

export default function PresentationSlide() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-8">
      {/* 1. We wrap everything in an AspectRatio Card to simulate a 16:9 Slide */}
      <Card className="w-full max-w-5xl shadow-2xl overflow-hidden border-slate-800 bg-slate-900 text-slate-100">
        <AspectRatio ratio={16 / 9}>
          <ScrollArea className="h-full w-full p-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // --- 1. HEADINGS (Typography & Slide Structure) ---
                h1: ({ ...props }) => (
                  <div className="mb-8 border-b border-slate-700 pb-4">
                    <h1
                      className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text"
                      {...props}
                    />
                  </div>
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="mt-10 mb-4 text-2xl font-semibold tracking-tight text-slate-200 border-l-4 border-blue-500 pl-4"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="mt-8 mb-2 text-xl font-semibold text-slate-300"
                    {...props}
                  />
                ),

                // --- 2. PARAGRAPHS & TEXT ---
                p: ({ ...props }) => (
                  <p
                    className="leading-7 [&:not(:first-child)]:mt-6 text-slate-400"
                    {...props}
                  />
                ),
                strong: ({ ...props }) => (
                  <span className="font-bold text-slate-100" {...props} />
                ),

                // --- 3. LISTS (Styling with custom markers) ---
                ul: ({ ...props }) => (
                  <ul
                    className="my-6 ml-6 list-disc [&>li]:mt-2 text-slate-300"
                    {...props}
                  />
                ),
                li: ({ children, ...props }) => {
                  // Hack to detect if this list item is a "task list" item (checkbox)
                  // remark-gfm adds a specialized structure we can detect, or we rely on the input type checkbox
                  return <li {...props}>{children}</li>;
                },

                // --- 4. BLOCKQUOTES -> ALERTS ---
                blockquote: ({ ...props }) => (
                  <div className="my-6">
                    <Alert className="bg-blue-950/50 border-blue-800 text-blue-200">
                      <Info className="h-4 w-4 stroke-blue-400" />
                      <AlertTitle className="text-blue-400 font-bold">
                        Important Note
                      </AlertTitle>
                      <AlertDescription className="mt-2 border-l-2 border-blue-800 pl-4 italic">
                        {props.children}
                      </AlertDescription>
                    </Alert>
                  </div>
                ),

                // --- 6. TABLES -> SHADCN TABLE COMPONENTS ---
                table: ({ ...props }) => (
                  <div className="my-8 rounded-md border border-slate-700 overflow-hidden">
                    <Table {...props} />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <TableHeader className="bg-slate-800" {...props} />
                ),
                tr: ({ ...props }) => (
                  <TableRow
                    className="hover:bg-slate-800/50 border-slate-700"
                    {...props}
                  />
                ),
                th: ({ ...props }) => (
                  <TableHead className="text-slate-200 font-bold" {...props} />
                ),
                td: ({ ...props }) => (
                  <TableCell className="text-slate-300" {...props} />
                ),

                // --- 7. LINKS -> BUTTONS / HOVERCARDS ---
                a: ({ href, children, ...props }) => (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="link"
                        className="text-blue-400 h-auto p-0 underline"
                        asChild
                      >
                        <a href={href} {...props}>
                          {children}
                        </a>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-slate-900 border-slate-700 text-slate-300">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarFallback>🔗</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">
                            External Link
                          </h4>
                          <p className="text-sm">
                            Navigates to:{" "}
                            <span className="text-blue-400">{href}</span>
                          </p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ),

                // --- 8. IMAGES -> CARD WITH CAPTION ---
                img: ({ ...props }) => (
                  <div className="my-8">
                    <Card className="overflow-hidden border-slate-700 bg-slate-800">
                      <AspectRatio ratio={16 / 5}>
                        <img
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                          src={props.src}
                          alt={props.alt}
                        />
                      </AspectRatio>
                      <CardFooter className="py-2 text-xs text-slate-400 bg-slate-900/50 justify-center">
                        Image: {props.alt}
                      </CardFooter>
                    </Card>
                  </div>
                ),

                // --- 9. HORIZONTAL RULE -> SEPARATOR ---
                hr: ({ ...props }) => (
                  <Separator className="my-12 bg-slate-700" {...props} />
                ),

                // --- 10. CHECKBOX (GFM TASK LISTS) ---
                input: ({ ...props }) => {
                  if (props.type === "checkbox") {
                    return (
                      <Checkbox
                        checked={props.checked}
                        disabled
                        className="mr-2 border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                    );
                  }
                  return <input {...props} />;
                },
              }}
            >
              {SLIDE_CONTENT_MARKDOWN}
            </ReactMarkdown>

            {/* Slide Footer */}
            <div className="mt-20 pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-500">
              <span>CONFIDENTIAL</span>
              <span>Page 1 of 1</span>
            </div>
          </ScrollArea>
        </AspectRatio>
      </Card>
    </div>
  );
}
