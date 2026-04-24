import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import { queryKeys } from "@/lib/queryKeys";

export interface PresentationAccessEntry {
  id: string;
  email: string;
  userId: string;
  presentationId: string;
  expiresAt: string | null;
  username?: string;
}

export function useReadOnlyShareAccessQuery(
  presentationId: string | null,
  enabled = true,
) {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.share.presentationAccess(presentationId ?? ""),
    queryFn: () =>
      api.get<PresentationAccessEntry[]>(
        `/api/presentations/${presentationId ?? ""}/access`,
      ),
    enabled: enabled && Boolean(presentationId),
  });
}

interface InviteAccessInput {
  email: string;
  expiresAt: string | null;
}

export function useInvitePresentationAccessMutation(
  presentationId: string | null,
) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, expiresAt }: InviteAccessInput) => {
      if (!presentationId) {
        throw new Error("Missing presentation id");
      }

      return api.post<PresentationAccessEntry>(
        `/api/presentations/${presentationId}/access`,
        {
          email,
          expiresAt,
        },
      );
    },
    onSuccess: async () => {
      if (!presentationId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.share.presentationAccess(presentationId),
      });
    },
  });
}

export function useRemovePresentationAccessMutation(
  presentationId: string | null,
) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accessId: string) => {
      const response = await api.del<{ success: boolean }>(
        `/api/access/${accessId}`,
      );
      return response;
    },
    onSuccess: async () => {
      if (!presentationId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.share.presentationAccess(presentationId),
      });
    },
  });
}

export function useGenerateShareLinkMutation(presentationId: string | null) {
  const api = useApiClient();

  return useMutation({
    mutationFn: async () => {
      if (!presentationId) {
        throw new Error("Missing presentation id");
      }

      return api.post<{ shareUrl: string }>(
        `/api/presentations/${presentationId}/share-link`,
      );
    },
  });
}
