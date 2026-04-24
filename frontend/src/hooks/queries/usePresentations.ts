import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import { queryKeys } from "@/lib/queryKeys";

export interface PresentationSummary {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  AccessType: "own" | "edit" | null;
}

export interface PresentationDetail extends PresentationSummary {
  slides: Array<{
    id: string;
    content: string;
    slideOrder: number;
    presentationId: string;
  }>;
  context: {
    id: string;
    prompt: string;
    presentationId: string | null;
  } | null;
}

interface CreatePresentationInput {
  title: string;
}

interface UpdatePresentationInput {
  presentationId: string;
  title: string;
  slides: Array<{
    content: string;
    slideOrder: number;
  }>;
}

export function usePresentationsQuery() {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.presentations.all(),
    queryFn: () => api.get<PresentationSummary[]>("/api/presentations"),
  });
}

export function usePresentationDetailQuery(
  presentationId: string | null,
  enabled = true,
) {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.presentations.detail(presentationId ?? ""),
    queryFn: () =>
      api.get<PresentationDetail>(`/api/presentation/${presentationId ?? ""}`),
    enabled: enabled && Boolean(presentationId),
  });
}

export function useCreatePresentationMutation() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title }: CreatePresentationInput) =>
      api.post<PresentationSummary>("/api/presentation", { title }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.all(),
      });
    },
  });
}

export function useUpdatePresentationMutation() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ presentationId, title, slides }: UpdatePresentationInput) =>
      api.put<PresentationDetail>(`/api/presentation/${presentationId}`, {
        title,
        slides,
      }),
    onSuccess: async (updatedPresentation) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.all(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.detail(updatedPresentation.id),
      });
    },
  });
}

export function useDeletePresentationMutation() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (presentationId: string) =>
      api.del<void>(`/api/presentation/${presentationId}`),
    onSuccess: async (_result, presentationId) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.all(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.presentations.detail(presentationId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.share.presentationAccess(presentationId),
      });
    },
  });
}
