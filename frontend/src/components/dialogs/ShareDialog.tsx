"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { ShareAccessGrantForm } from "@/components/dialogs/ShareAccessGrantForm";
import { ShareLinkControls } from "@/components/dialogs/ShareLinkControls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateShareLinkMutation,
  usePresentationAccessQuery,
  useRemovePresentationAccessMutation,
  useRevokeShareLinkMutation,
  useShareLinkStatusQuery,
  useUpsertPresentationAccessMutation,
} from "@/hooks/queries/usePresentationAccess";

interface ShareDialogProps {
  presentationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
  presentationId,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [freshShareUrl, setFreshShareUrl] = useState<string | null>(null);
  const grantsQuery = usePresentationAccessQuery(presentationId, open);
  const upsertGrant = useUpsertPresentationAccessMutation(presentationId);
  const removeGrant = useRemovePresentationAccessMutation(presentationId);
  const linkStatusQuery = useShareLinkStatusQuery(presentationId, open);
  const createLink = useCreateShareLinkMutation(presentationId);
  const revokeLink = useRevokeShareLinkMutation(presentationId);

  const rotateLink = async (expiresAt: string | null) => {
    const result = await createLink.mutateAsync(expiresAt);
    setFreshShareUrl(result.shareUrl);
  };

  const revokeCurrentLink = async () => {
    await revokeLink.mutateAsync();
    setFreshShareUrl(null);
    toast.success("Share link revoked");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setFreshShareUrl(null);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share presentation</DialogTitle>
          <DialogDescription>
            Invite registered collaborators or create an anonymous read-only
            link.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">People with access</h3>
            <p className="text-sm text-muted-foreground">
              Viewers see slides. Editors can also change presentation content.
            </p>
          </div>
          <ShareAccessGrantForm
            pending={upsertGrant.isPending}
            onSubmit={async (input) => {
              await upsertGrant.mutateAsync(input);
              toast.success("Access updated");
            }}
          />
          {grantsQuery.isPending ? (
            <p className="text-sm text-muted-foreground">
              <Spinner className="mr-1 inline" /> Loading access…
            </p>
          ) : null}
          <div className="space-y-2">
            {(grantsQuery.data ?? []).map((grant) => (
              <div
                key={grant.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {grant.user.username || grant.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {grant.user.email} · {grant.permission}
                    {grant.expiresAt
                      ? ` · expires ${new Date(grant.expiresAt).toLocaleString()}`
                      : " · no expiry"}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={removeGrant.isPending}
                  onClick={() => removeGrant.mutate(grant.id)}
                >
                  <Trash2Icon className="mr-1 size-4" /> Revoke
                </Button>
              </div>
            ))}
            {grantsQuery.isSuccess && grantsQuery.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active collaborator grants.
              </p>
            ) : null}
          </div>
        </section>

        <ShareLinkControls
          status={linkStatusQuery.data}
          freshShareUrl={freshShareUrl}
          creating={createLink.isPending}
          revoking={revokeLink.isPending}
          onCreate={rotateLink}
          onRevoke={revokeCurrentLink}
        />
      </DialogContent>
    </Dialog>
  );
}
