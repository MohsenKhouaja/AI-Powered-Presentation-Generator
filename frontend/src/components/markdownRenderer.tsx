import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div style={{ fontSize: "32px" }} className="w-full h-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // --- 1. HEADINGS ---
          h1: ({ ...props }) => (
            <div className="mb-2 border-b border-border pb-2">
              <h1
                style={{ fontSize: "2.6em" }}
                className="font-extrabold tracking-tight text-primary"
                {...props}
              />
            </div>
          ),
          h2: ({ ...props }) => (
            <h2
              style={{ fontSize: "1.8em" }}
              className="mt-4 mb-2 font-bold tracking-tight text-foreground border-l-8 border-chart-2 pl-4 py-1 bg-secondary/20 rounded-r-lg"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              style={{ fontSize: "1.4em" }}
              className="mb-2 font-semibold text-foreground"
              {...props}
            />
          ),

          // --- 2. PARAGRAPHS & TEXT ---
          p: ({ ...props }) => (
            <p
              style={{ fontSize: "1em" }}
              className="leading-relaxed text-muted-foreground"
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <span className="font-extrabold text-foreground" {...props} />
          ),

          // --- 3. LISTS ---
          ul: ({ ...props }) => (
            <ul
              style={{ fontSize: "1em" }}
              className="my-3 ml-6 list-disc [&>li]:mt-2 marker:text-chart-4 text-foreground/90"
              {...props}
            />
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="pl-1">
              {children}
            </li>
          ),

          // --- 4. BLOCKQUOTE ---
          blockquote: ({ ...props }) => (
            <div className="my-4 transform hover:scale-[1.01] transition-transform duration-300">
              <Alert className="bg-accent/10 border-l-4 border-l-accent border-y-0 border-r-0 rounded-[var(--radius)] text-foreground shadow-sm">
                <Info className="h-5 w-5 text-foreground" />
                <AlertTitle
                  style={{ fontSize: "1.3em" }}
                  className="text-foreground font-bold uppercase tracking-wider ml-2"
                >
                  Insight
                </AlertTitle>
                <AlertDescription
                  style={{ fontSize: "1.6em", lineHeight: "1.4" }}
                  className="mt-3 pl-2 text-foreground font-semibold italic"
                >
                  {props.children}
                </AlertDescription>
              </Alert>
            </div>
          ),

          // --- 5. TABLES ---
          table: ({ ...props }) => (
            <div className="my-4 rounded-md border border-primary overflow-hidden bg-card shadow-sm">
              <Table {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <TableHeader className="bg-muted/50" {...props} />
          ),
          tr: ({ ...props }) => (
            <TableRow
              className="hover:bg-muted/50 border-b border-border"
              {...props}
            />
          ),
          th: ({ ...props }) => (
            <TableHead
              style={{ fontSize: "0.9em" }}
              className="text-foreground font-bold"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <TableCell
              style={{ fontSize: "0.9em" }}
              className="text-muted-foreground"
              {...props}
            />
          ),

          // --- 6. LINKS ---
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
                    <h4
                      style={{ fontSize: "0.875em" }}
                      className="font-semibold"
                    >
                      External Link
                    </h4>
                    <p
                      style={{ fontSize: "0.875em" }}
                      className="text-muted-foreground"
                    >
                      Navigates to:{" "}
                      <span className="text-primary">{href}</span>
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ),

          // --- 7. IMAGES ---
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
                <CardFooter
                  style={{ fontSize: "0.75em" }}
                  className="py-2 text-muted-foreground bg-muted/50 justify-center"
                >
                  Image: {props.alt}
                </CardFooter>
              </Card>
            </div>
          ),

          // --- 8. HORIZONTAL RULE ---
          hr: ({ ...props }) => (
            <Separator className="my-4 bg-border" {...props} />
          ),

          // --- 10. CHECKBOXES ---
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
  );
}