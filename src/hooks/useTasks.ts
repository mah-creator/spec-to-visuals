import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Task, CreateTaskDto, UpdateTaskStatusDto } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useTasks = (projectId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => apiClient.getTasks(projectId!),
    enabled: !!projectId,
  });

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
    mutationFn: ({ taskId, status }: { taskId: string; status: UpdateTaskStatusDto }) =>
      apiClient.updateTaskStatus(projectId!, taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
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