"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteEmail: string;
  inviteExpiresAt: string;
  isPending: boolean;
  onEmailChange: (email: string) => void;
  onExpiresAtChange: (expiresAt: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  inviteEmail,
  inviteExpiresAt,
  isPending,
  onEmailChange,
  onExpiresAtChange,
  onSubmit,
}: ShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Presentation</DialogTitle>
          <DialogDescription>
            Invite collaborators with edit access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <form className="space-y-2" onSubmit={onSubmit}>
            <p className="text-sm font-medium">Invite collaborator</p>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="name@example.com"
              aria-label="Invite collaborator email"
            />
            <Input
              type="datetime-local"
              value={inviteExpiresAt}
              onChange={(event) => onExpiresAtChange(event.target.value)}
              aria-label="Invite expiration"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner className="mr-1" /> : null}
              Invite
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}