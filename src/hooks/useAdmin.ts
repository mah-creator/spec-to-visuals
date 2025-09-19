import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const { toast } = useToast();

  const suspendUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.suspendUser(userId),
    onSuccess: () => {
      toast({
        title: "User suspended",
        description: "The user has been suspended successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to suspend user",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const unsuspendUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.unsuspendUser(userId),
    onSuccess: () => {
      toast({
        title: "User unsuspended",
        description: "The user has been unsuspended successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to unsuspend user",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  return {
    suspendUser: suspendUserMutation.mutate,
    unsuspendUser: unsuspendUserMutation.mutate,
    isSuspending: suspendUserMutation.isPending,
    isUnsuspending: unsuspendUserMutation.isPending,
  };
};