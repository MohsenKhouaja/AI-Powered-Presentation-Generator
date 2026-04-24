import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  fileType: string;
  contextId: string;
}

interface CreateContextInput {
  prompt: string;
  files?: File[];
}

interface UpdateContextInput {
  contextId: string;
  prompt: string;
  deletedFilesIds?: string[];
  files?: File[];
}

interface CreateContextResponse {
  context: ContextRecord;
  files: SharedFileRecord[];
}

interface UpdateContextResponse {
  context: ContextRecord;
  newFiles: SharedFileRecord[];
  deletedFilesIds: string[];
}

function buildContextFormData(
  prompt: string,
  files: File[] = [],
  deletedFilesIds: string[] = [],
): FormData {
  const formData = new FormData();
  formData.append("prompt", prompt);

  for (const file of files) {
    formData.append("files", file);
  }

  formData.append("deletedFilesIds", JSON.stringify(deletedFilesIds));

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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.contexts.files(contextId ?? ""),
    queryFn: async (): Promise<SharedFileRecord[]> => {
      if (!contextId) {
        return [];
      }

      const cachedFiles = queryClient.getQueryData<SharedFileRecord[]>(
        queryKeys.contexts.files(contextId),
      );

      return cachedFiles ?? [];
    },
    enabled: enabled && Boolean(contextId),
  });
}

export function useCreateContextMutation() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prompt, files = [] }: CreateContextInput) => {
      const body = buildContextFormData(prompt, files);
      return api.post<CreateContextResponse>("/api/contexts", body);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.contexts.all(),
      });
      queryClient.setQueryData(
        queryKeys.contexts.detail(result.context.id),
        result.context,
      );
      if (result.context.presentationId) {
        queryClient.setQueryData(
          queryKeys.contexts.byPresentation(result.context.presentationId),
          result.context,
        );
      }
      queryClient.setQueryData(
        queryKeys.contexts.files(result.context.id),
        result.files,
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.details(),
      });
    },
  });
}

export function useUpdateContextMutation() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contextId,
      prompt,
      deletedFilesIds = [],
      files = [],
    }: UpdateContextInput) => {
      const body = buildContextFormData(prompt, files, deletedFilesIds);
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
  });
}
