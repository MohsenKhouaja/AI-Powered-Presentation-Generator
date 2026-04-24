import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { queryKeys } from "@/lib/queryKeys";

interface AuthCredentials {
  email: string;
  password: string;
}

interface SessionSnapshot {
  isLoggedIn: boolean;
  token: string | null;
}

export function useSessionQuery() {
  const { isLoggedIn, token } = useAuth();

  return useQuery<SessionSnapshot>({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => ({
      isLoggedIn,
      token,
    }),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }: AuthCredentials) => {
      await login(email, password);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.all(),
      });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const { register } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }: AuthCredentials) => {
      await register(email, password);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.all(),
      });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      logout();
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: queryKeys.presentations.all() });
      queryClient.removeQueries({
        queryKey: queryKeys.presentations.details(),
      });
      queryClient.removeQueries({ queryKey: queryKeys.share.root() });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
    },
  });
}
