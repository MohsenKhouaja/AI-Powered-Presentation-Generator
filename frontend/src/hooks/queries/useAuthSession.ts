import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onError: () => toast.error("Invalid email or password"),
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
    onError: () => toast.error("Could not create account"),
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
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
    },
    onError: () => toast.error("Failed to sign out"),
  });
}
