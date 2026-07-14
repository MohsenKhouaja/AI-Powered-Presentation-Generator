import { useMutation } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";

export interface PresentationAccessEntry {
  id: string;
  email: string;
  userId: string;
  presentationId: string;
  expiresAt: string | null;
  username?: string;
}

interface InviteAccessInput {
  email: string;
  expiresAt: string | null;
}

export function useInvitePresentationAccessMutation(
  presentationId: string | null,
) {
  const api = useApiClient();

  return useMutation({
    mutationFn: async ({ email, expiresAt }: InviteAccessInput) => {
      if (!presentationId) {
        throw new Error("E054: Missing presentation id");
      }

      return api.post<PresentationAccessEntry>(
        `/api/presentations/${presentationId}/access`,
        {
          email,
          expiresAt,
        },
      );
    },
  });
}
