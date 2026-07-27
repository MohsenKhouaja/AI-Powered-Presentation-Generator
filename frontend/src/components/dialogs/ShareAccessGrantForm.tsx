import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { GrantPermission } from "@/hooks/queries/usePresentationAccess";

interface ShareAccessGrantFormProps {
  pending: boolean;
  onSubmit: (input: {
    email: string;
    permission: GrantPermission;
    expiresAt: string | null;
  }) => Promise<void>;
}

const asIsoDate = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

export function ShareAccessGrantForm({
  pending,
  onSubmit,
}: ShareAccessGrantFormProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<GrantPermission>("viewer");
  const [expiresAt, setExpiresAt] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    await onSubmit({
      email: email.trim(),
      permission,
      expiresAt: asIsoDate(expiresAt),
    });
    setEmail("");
    setExpiresAt("");
  };

  return (
    <form className="grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={submit}>
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="registered@example.com"
        aria-label="Collaborator email"
      />
      <Select
        value={permission}
        onValueChange={(value) => setPermission(value as GrantPermission)}
      >
        <SelectTrigger aria-label="Permission" className="w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="datetime-local"
        value={expiresAt}
        onChange={(event) => setExpiresAt(event.target.value)}
        aria-label="Grant expiration"
      />
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="mr-1" /> : null}
        Grant access
      </Button>
    </form>
  );
}
