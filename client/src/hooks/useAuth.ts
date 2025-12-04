import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface LogoutCallbacks {
  onSuccess?: () => void;
  onError?: () => void;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
  });

  const logout = (callbacks?: LogoutCallbacks) => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
        window.location.href = "/";
      },
      onError: () => {
        callbacks?.onError?.();
      },
    });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
