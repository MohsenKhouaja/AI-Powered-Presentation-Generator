import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiClient } from "@/hooks/useApiClient";
import { queryKeys } from "@/lib/queryKeys";

export type GrantPermission = "viewer" | "editor";

export interface PresentationAccessGrant {
  id: string;
  permission: GrantPermission;
  expiresAt: string | null;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ShareLinkStatus {
  active: boolean;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function usePresentationAccessQuery(
  presentationId: string | null,
  enabled: boolean,
) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.access.grants(presentationId ?? ""),
    queryFn: () =>
      api.get<PresentationAccessGrant[]>(
        `/api/presentations/${presentationId}/access`,
      ),
    enabled: enabled && Boolean(presentationId),
  });
}

export function useUpsertPresentationAccessMutation(
  presentationId: string | null,
) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      email: string;
      permission: GrantPermission;
      expiresAt: string | null;
    }) =>
      api.post<PresentationAccessGrant>(
        `/api/presentations/${presentationId}/access`,
        input,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.access.grants(presentationId ?? ""),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.all(),
      });
    },
    onError: (error) => toast.error(error.message || "Could not grant access"),
  });
}

export function useRemovePresentationAccessMutation(
  presentationId: string | null,
) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grantId: string) =>
      api.del<void>(
        `/api/presentations/${presentationId}/access/${grantId}`,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.access.grants(presentationId ?? ""),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.all(),
      });
    },
    onError: (error) => toast.error(error.message || "Could not revoke access"),
  });
}

export function useShareLinkStatusQuery(
  presentationId: string | null,
  enabled: boolean,
) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.access.shareLink(presentationId ?? ""),
    queryFn: () =>
      api.get<ShareLinkStatus>(
        `/api/presentations/${presentationId}/share-link`,
      ),
    enabled: enabled && Boolean(presentationId),
  });
}

export function useCreateShareLinkMutation(
  presentationId: string | null,
) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expiresAt: string | null) =>
      api.post<{ shareUrl: string; expiresAt: string | null }>(
        `/api/presentations/${presentationId}/share-link`,
        { expiresAt },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.access.shareLink(presentationId ?? ""),
      });
    },
    onError: (error) =>
      toast.error(error.message || "Could not create share link"),
  });
}

export function useRevokeShareLinkMutation(
  presentationId: string | null,
) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.del<void>(`/api/presentations/${presentationId}/share-link`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.access.shareLink(presentationId ?? ""),
      });
    },
    onError: (error) =>
      toast.error(error.message || "Could not revoke share link"),
  });
}
