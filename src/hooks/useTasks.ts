import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Task, CreateTaskDto, UpdateTaskStatusDto, Comment } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { signalRService } from '@/lib/signalr';
import { useProjects } from './useProjects';

export const useTasks = (projectId: string | undefined, page: number = 1, pageSize: number = 10) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateProjectStatus } = useProjects();

  const {
    data: tasksData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks', projectId, page, pageSize],
    queryFn: () => apiClient.getTasks(projectId!, { page, pageSize }),
    enabled: !!projectId,
  });

  // Set up SignalR connection for real-time comments from OTHER users
  useEffect(() => {
    if (!projectId) return;

    const token = apiClient.getToken();
    if (!token) return;

    const connectSignalR = async () => {
      try {
        if (!signalRService.isConnected()) {
          await signalRService.connect(token);
        }

       // In the SignalR effect in useTasks
const unsubscribe = signalRService.onComment((newComment: Comment) => {
  console.log('Received real-time comment from other user:', newComment);
  
  // Update the tasks cache with the new comment from other users
  queryClient.setQueryData(
    ['tasks', projectId, page, pageSize],
    (old: any) => {
      if (!old?.items) return old;
      
      return {
        ...old,
        items: old.items.map((task: any) => {
          if (task.id !== newComment.taskId) return task;
          
          const existingComments = task.comments || [];
          
          // Check if this comment already exists (in case of any overlap)
          const commentAlreadyExists = existingComments.some(
            (comment: Comment) => comment.id === newComment.id
          );
          
          if (commentAlreadyExists) {
            console.log('Comment already exists, skipping duplicate');
            return task;
          }
          
          // Add the new comment from other user
          return {
            ...task,
            comments: [...existingComments, newComment]
          };
        })
      };
    }
  );

  // Show notification for comments from other users
  toast({
    title: 'New comment',
    description: `${newComment.author}: ${newComment.message.substring(0, 50)}${newComment.message.length > 50 ? '...' : ''}`,
  });
});

        return unsubscribe;
      } catch (error) {
        console.error('Failed to connect to SignalR for comments:', error);
      }
    };

    const cleanupPromise = connectSignalR();

    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, [projectId, page, pageSize, queryClient, toast]);

  const tasks = tasksData?.items || [];
  const totalPages = tasksData ? Math.ceil(tasksData.totalCount / pageSize) : 0;

  const createTaskMutation = useMutation({
    mutationFn: (task: CreateTaskDto) => apiClient.createTask(projectId!, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      apiClient.updateTaskStatus(projectId!, taskId, { status }),
    onSuccess: async (_, variables) => {
      // Invalidate and refetch tasks to get updated data
      await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    totalPages,
    totalCount: tasksData?.totalCount || 0,
    createTask: createTaskMutation.mutate,
    updateTaskStatus: updateTaskStatusMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskStatusMutation.isPending,
  };
};

export const useTask = (projectId: string | undefined, taskId: string | undefined) => {
  const {
    data: task,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: () => apiClient.getTask(projectId!, taskId!),
    enabled: !!projectId && !!taskId,
  });

  return {
    task,
    isLoading,
    error,
  };
};



export const useCompletedTasks = () => {
  const {
    data: task,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['completed-user-task'],
    queryFn: () => apiClient.getCompletedTasks(),
  });

  return {
    task,
    isLoading,
    error,
  };
};

export const usePendingTasks = () => {
  const {
    data: task,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pending-user-task'],
    queryFn: () => apiClient.getPendingTasks(),
  });

  return {
    task,
    isLoading,
    error,
  };
};

export const useTaskComments = (projectId: string | undefined, page: number = 1, pageSize: number = 10) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: async ({ projectId, taskId, comment }: { projectId: string; taskId: string; comment: string }) => {
      const newComment = await apiClient.addTaskComment(projectId, taskId, comment);
      return newComment;
    },
    onSuccess: (newComment: Comment, variables) => {
      // Use the SAME query key as SignalR and the main tasks query
      queryClient.setQueryData(
        ['tasks', variables.projectId, page, pageSize], // Add page and pageSize
        (old: any) => {
          if (!old?.items) return old;
          
          return {
            ...old,
            items: old.items.map((task: any) => 
              task.id === variables.taskId 
                ? { 
                    ...task, 
                    comments: [...(task.comments || []), newComment] 
                  }
                : task
            )
          };
        }
      );

      // toast({
      //   title: "Comment added",
      //   description: "Your comment has been added successfully.",
      // });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to add comment",
        description: error.message || "An error occurred",
      });
    },
  });

  return {
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
  };
};