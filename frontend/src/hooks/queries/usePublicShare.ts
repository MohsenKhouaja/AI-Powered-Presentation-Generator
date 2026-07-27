import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export interface PublicSharedPresentation {
  title: string;
  slides: Array<{
    id: string;
    content: string;
    slideOrder: number;
  }>;
}

export function usePublicSharedPresentationQuery(token: string | null) {
  return useQuery({
    queryKey: [...queryKeys.access.publicShare(), token],
    queryFn: async (): Promise<PublicSharedPresentation> => {
      const response = await fetch("/api/public/share/presentation", {
        headers: { "X-Share-Token": token ?? "" },
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("This shared presentation is unavailable");
      }
      return (await response.json()) as PublicSharedPresentation;
    },
    enabled: Boolean(token),
    retry: false,
    meta: { suppressGlobalErrorToast: true },
  });
}
