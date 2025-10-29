import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Project, CreateProjectDto } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useProjects = (page: number = 1, pageSize: number = 10, status?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: projectsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects', page, pageSize, status],
    queryFn: () => apiClient.getProjects({ page, pageSize, status }),
  });

  const projects = projectsData?.items || [];
  const totalPages = projectsData ? Math.ceil(projectsData.totalCount / pageSize) : 0;

  const createProjectMutation = useMutation({
    mutationFn: (project: CreateProjectDto) => apiClient.createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create project",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const updateProjectStatusMutation = useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: string }) =>
      apiClient.updateProjectStatus(projectId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update project status",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const inviteToProjectMutation = useMutation({
    mutationFn: ({ projectId, email }: { projectId: string; email: string }) =>
      apiClient.inviteToProject(projectId, email),
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "The invitation has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to send invitation",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  return {
    projects,
    isLoading,
    error,
    totalPages,
    totalCount: projectsData?.totalCount || 0,
    createProject: createProjectMutation.mutate,
    updateProjectStatus: updateProjectStatusMutation.mutate,
    inviteToProject: inviteToProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isInviting: inviteToProjectMutation.isPending,
    isUpdatingStatus: updateProjectStatusMutation.isPending,
  };
};

export const useProject = (projectId: string | undefined) => {
  const { toast } = useToast();

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.getProject(projectId!),
    enabled: !!projectId,
  });

  return {
    project,
    isLoading,
    error,
  };
};