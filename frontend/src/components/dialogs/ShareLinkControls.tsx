import { useState } from "react";
import { CopyIcon, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { ShareLinkStatus } from "@/hooks/queries/usePresentationAccess";

interface ShareLinkControlsProps {
  status: ShareLinkStatus | undefined;
  freshShareUrl: string | null;
  creating: boolean;
  revoking: boolean;
  onCreate: (expiresAt: string | null) => Promise<void>;
  onRevoke: () => Promise<void>;
}

const asIsoDate = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

export function ShareLinkControls({
  status,
  freshShareUrl,
  creating,
  revoking,
  onCreate,
  onRevoke,
}: ShareLinkControlsProps) {
  const [expiresAt, setExpiresAt] = useState("");

  const copyLink = async () => {
    if (!freshShareUrl) return;
    await navigator.clipboard.writeText(freshShareUrl);
    toast.success("Share link copied");
  };

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="font-medium">Anyone with the link</h3>
        <p className="text-sm text-muted-foreground">
          Anonymous visitors can view only the title and slides.
        </p>
        {status?.active ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Active
            {status.expiresAt
              ? ` · expires ${new Date(status.expiresAt).toLocaleString()}`
              : " · no expiry"}
          </p>
        ) : null}
      </div>

      <Input
        type="datetime-local"
        value={expiresAt}
        onChange={(event) => setExpiresAt(event.target.value)}
        aria-label="Share link expiration"
      />

      {freshShareUrl ? (
        <div className="space-y-2 rounded-md bg-muted/50 p-3">
          <p className="text-sm font-medium">Copy this link now</p>
          <p className="break-all font-mono text-xs">{freshShareUrl}</p>
          <p className="text-xs text-muted-foreground">
            For security, the app cannot show this exact link again. You can
            replace it with a new one later.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={copyLink}>
            <CopyIcon className="mr-1 size-4" /> Copy link
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={creating}
          onClick={() => onCreate(asIsoDate(expiresAt))}
        >
          {creating ? (
            <Spinner className="mr-1" />
          ) : (
            <LinkIcon className="mr-1 size-4" />
          )}
          {status?.active ? "Replace link" : "Create link"}
        </Button>
        {status?.active ? (
          <Button
            type="button"
            variant="ghost"
            disabled={revoking}
            onClick={onRevoke}
          >
            Revoke link
          </Button>
        ) : null}
      </div>
    </section>
  );
}
