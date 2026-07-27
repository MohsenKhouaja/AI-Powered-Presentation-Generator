import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiClient } from "@/hooks/useApiClient";
import { queryKeys } from "@/lib/queryKeys";
import { usePresentationDetailQuery } from "@/hooks/queries/usePresentations";

export interface ContextRecord {
  id: string;
  prompt: string;
  presentationId: string | null;
}

export interface SharedFileRecord {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  contextId: string;
}

interface UpdateContextInput {
  contextId: string;
  prompt: string;
  deletedFileIds?: string[];
  files?: File[];
}

interface UpdateContextResponse {
  context: ContextRecord;
  newFiles: SharedFileRecord[];
  deletedFileIds: string[];
}

function buildContextFormData(
  prompt: string,
  files: File[] = [],
  deletedFileIds: string[] = [],
): FormData {
  const formData = new FormData();
  formData.append("prompt", prompt);

  for (const file of files) {
    formData.append("files", file);
  }

  if (deletedFileIds.length > 0) {
    formData.append("deletedFileIds", JSON.stringify(deletedFileIds));
  }

  return formData;
}

export function useContextByPresentationQuery(presentationId: string | null) {
  const detailQuery = usePresentationDetailQuery(
    presentationId,
    Boolean(presentationId),
  );

  return useQuery({
    queryKey: queryKeys.contexts.byPresentation(presentationId ?? ""),
    queryFn: async (): Promise<ContextRecord | null> =>
      detailQuery.data?.context ?? null,
    enabled: Boolean(presentationId) && detailQuery.isSuccess,
  });
}

export function useContextFilesQuery(contextId: string | null, enabled = true) {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.contexts.files(contextId ?? ""),
    queryFn: async (): Promise<SharedFileRecord[]> => {
      if (!contextId) {
        return [];
      }

      const context = await api.get<{ files: SharedFileRecord[] }>(
        `/api/contexts/${contextId}`,
      );

      return context.files ?? [];
    },
    enabled: enabled && Boolean(contextId),
  });
}

export function useUpdateContextMutation() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contextId,
      prompt,
      deletedFileIds = [],
      files = [],
    }: UpdateContextInput) => {
      const body = buildContextFormData(prompt, files, deletedFileIds);
      return api.put<UpdateContextResponse>(`/api/contexts/${contextId}`, body);
    },
    onSuccess: async (result, variables) => {
      const updatedContext = {
        id: variables.contextId,
        prompt: result.context.prompt,
        presentationId: result.context.presentationId ?? null,
      };

      queryClient.setQueryData(
        queryKeys.contexts.detail(variables.contextId),
        updatedContext,
      );
      if (updatedContext.presentationId) {
        queryClient.setQueryData(
          queryKeys.contexts.byPresentation(updatedContext.presentationId),
          updatedContext,
        );
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.contexts.files(variables.contextId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.details(),
      });
    },
    onError: () => toast.error("Could not update context"),
  });
}
