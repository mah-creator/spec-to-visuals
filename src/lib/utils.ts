import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeDifference(targetDate: Date): string {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = now - target;

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (days > 1) return targetDate.toDateString();
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
}

  export function formatTimestamp (timestamp: string): string {
    try {
      const date = timestamp.charAt(timestamp.length - 1) === 'Z' 
        ? new Date(timestamp) 
        : new Date(`${timestamp}Z`);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

export function getNotificationUrl(metadata?: { 
  resourceType?: string; 
  resourceId?: string; 
  projectId?: string; 
  taskId?: string;
  fileId?: string;
}): string {
  if (!metadata) return '/';

  const { resourceType, resourceId, projectId, taskId, fileId } = metadata;

  switch (resourceType) {
    case 'project':
      return projectId ? `/project/${projectId}` : '/';
    
    case 'task':
      if (projectId && taskId) {
        return `/project/${projectId}?taskId=${taskId}`;
      }
      return projectId ? `/project/${projectId}` : '/';
    
    case 'comment':
      if (projectId && taskId) {
        return `/project/${projectId}?taskId=${taskId}`;
      }
      return projectId ? `/project/${projectId}` : '/';
    
    case 'file':
      if (projectId && fileId) {
        return `/project/${projectId}?fileId=${fileId}`;
      }
      return projectId ? `/project/${projectId}` : '/';
    
    case 'invitation':
      return resourceId ? `/profile?invitationId=${resourceId}` : '/profile';
    
    default:
      return '/';
  }
}
