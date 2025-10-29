// hooks/useInvitationsByStatus.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Invitation } from '@/types/api';
import { toast } from '@/hooks/use-toast';

export const useInvitationsByStatus = (status: 'Pending' | 'Accepted' | 'Declined', page: number = 1, pageSize: number = 10) => {
  const queryClient = useQueryClient();

  const { data: invitationsData, isLoading } = useQuery({
    queryKey: ['invitations', status, page, pageSize],
    queryFn: () => apiClient.getInvitationsByStatus({ status, page, pageSize }),
  });

  const invitations = invitationsData?.items || [];
  const totalPages = invitationsData ? Math.ceil(invitationsData.totalCount / pageSize) : 0;

  const acceptMutation = useMutation({
    mutationFn: (invitationId: string) => apiClient.acceptInvitation(invitationId),
    onSuccess: () => {
      // Invalidate all invitation queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Invitation accepted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (invitationId: string) => apiClient.declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({
        title: 'Success',
        description: 'Invitation declined',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    invitations,
    isLoading,
    totalPages,
    totalCount: invitationsData?.totalCount || 0,
    acceptInvitation: acceptMutation.mutate,
    declineInvitation: declineMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
};