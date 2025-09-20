import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { FileUploadRequest, FileResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useTaskFiles = (taskId: string) => {
  const {
    data: files = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['task-files', taskId],
    queryFn: () => apiClient.getTaskFiles(taskId),
    enabled: !!taskId,
  });

  return {
    files,
    isLoading,
    error,
  };
};

export const useFileUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadFileMutation = useMutation({
    mutationFn: (uploadData: FileUploadRequest) => apiClient.uploadFile(uploadData),
    onSuccess: (data, variables) => {
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
      // Invalidate task files query if taskId exists
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: ['task-files', variables.taskId] });
      }
      // Invalidate project files if we had such a query
      queryClient.invalidateQueries({ queryKey: ['project-files', variables.projectId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to upload file",
        description: error.message || "An error occurred",
      });
    },
  });

  return {
    uploadFile: uploadFileMutation.mutate,
    isUploading: uploadFileMutation.isPending,
  };
};