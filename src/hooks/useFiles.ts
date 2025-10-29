import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { FileUploadRequest, FileResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useTaskFiles = (taskId: string) => {
  const {
    data: filesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['task-files', taskId],
    queryFn: () => apiClient.getTaskFiles(taskId),
    enabled: !!taskId,
  });

  const files = filesData?.items || [];

  return {
    files,
    isLoading,
    error,
  };
};

export const useRecentFiles = (page: number = 1, pageSize: number = 10) => {
  const {
    data: filesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recent-files', page, pageSize],
    queryFn: () => apiClient.getRecentFiles({ page, pageSize }),
  });

  const files = filesData?.items || [];
  const totalPages = filesData ? Math.ceil(filesData.totalCount / pageSize) : 0;

  return {
    files,
    isLoading,
    error,
    totalPages,
    totalCount: filesData?.totalCount || 0,
  };
};

export const useProjectFiles = (projectId: string, page: number = 1, pageSize: number = 10) => {
  const {
    data: filesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project-files', projectId, page, pageSize],
    queryFn: () => apiClient.getProjectFiles(projectId, { page, pageSize }),
    enabled: !!projectId,
  });

  const files = filesData?.items || [];
  const totalPages = filesData ? Math.ceil(filesData.totalCount / pageSize) : 0;

  return {
    files,
    isLoading,
    error,
    totalPages,
    totalCount: filesData?.totalCount || 0,
  };
};

export const useFileUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadFileMutation = useMutation({
    mutationFn: ({ uploadData, onProgress }: { uploadData: FileUploadRequest; onProgress?: (progress: number) => void }) => 
      apiClient.uploadFile(uploadData, onProgress),
    onSuccess: (data, variables) => {
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
      // Invalidate task files query if taskId exists
      if (variables.uploadData.taskId) {
        queryClient.invalidateQueries({ queryKey: ['task-files', variables.uploadData.taskId] });
      }
      // Invalidate project files if we had such a query
      queryClient.invalidateQueries({ queryKey: ['project-files', variables.uploadData.projectId] });
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