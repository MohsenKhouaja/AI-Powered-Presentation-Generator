"use client";

import { Link } from "react-router-dom";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PresentationCardProps {
  id: string;
  title: string;
  createdAt: string;
  badgeLabel: string;
  badgeVariant?: "outline" | "default" | "secondary" | "destructive";
  actions: Array<
    | {
        type: "link";
        label: string;
        to: string;
        variant?: "outline" | "default";
      }
    | {
        type: "button";
        label: string;
        onClick: () => void;
        variant?: "destructive" | "default" | "outline";
        disabled?: boolean;
      }
  >;
  className?: string;
}

export function PresentationCard({
  id,
  title,
  createdAt,
  badgeLabel,
  badgeVariant = "outline",
  actions,
  className,
}: PresentationCardProps) {
  return (
    <Card
      key={id}
      className={`rounded-[16px] bg-white shadow-[var(--shadow-subtle-7)] ${className ?? ""}`}
    >
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Created {new Date(createdAt).toLocaleString()}
        </p>
        <Badge variant={badgeVariant} className="mt-2">
          {badgeLabel}
        </Badge>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {actions.map((action, index) => {
          if (action.type === "link") {
            return (
              <Button
                key={index}
                asChild
                size="sm"
                variant={action.variant ?? "outline"}
              >
                <Link to={action.to}>{action.label}</Link>
              </Button>
            );
          }
          return (
            <Button
              key={index}
              size="sm"
              variant={action.variant ?? "destructive"}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label === "Delete" && (
                <Trash2Icon className="mr-1 size-4" />
              )}
              {action.label}
            </Button>
          );
        })}
      </CardFooter>
    </Card>
  );
}