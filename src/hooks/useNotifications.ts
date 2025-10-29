import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Notification } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { signalRService } from '@/lib/signalr';

export const useNotifications = (page: number = 1, pageSize: number = 10) => {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', page, pageSize],
    queryFn: () => apiClient.getNotifications({ page, pageSize }),
  });

  const notifications = notificationsData?.items || [];
  const totalPages = notificationsData ? Math.ceil(notificationsData.totalCount / pageSize) : 0;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiClient.markAllNotificationAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Connect to SignalR and listen for real-time notifications
  useEffect(() => {
    const token = apiClient.getToken();
    if (!token) return;

    const connectSignalR = async () => {
      try {
        if (!signalRService.isConnected()) {
          await signalRService.connect(token);
        }

        const unsubscribe = signalRService.onNotification((notification) => {
          // Invalidate all notification queries to refetch
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          // Show toast for new notification
          toast({
            title: notification.title,
            description: notification.message,
          });
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to connect to SignalR:', error);
      }
    };

    const cleanupPromise = connectSignalR();

    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, [queryClient]); // Only depend on queryClient, not page

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    totalPages,
    totalCount: notificationsData?.totalCount || 0,
    hasMore: notificationsData ? (page * pageSize) < notificationsData.totalCount : false,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
};