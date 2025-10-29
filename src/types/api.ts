// API Types based on OpenAPI spec
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
  role: string;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  dueDate?: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  dueDate?: string;
}

export interface UpdateTaskStatusDto {
  status: string;
}

// Response types (inferred from typical API responses)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'freelancer' | 'customer';
}

export interface LoginResponse {
  token?: string;
  expiresAt?: string;
  user?: User;
  // Additional fields that might come from .NET API
  userId?: string;
  name?: string;
  userName?: string;
  email?: string;
  role?: string;
  [key: string]: any; // Allow for unknown fields
}

export interface Project {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for dashboard display
  status?: 'Active' | 'Completed' | 'Deleted' | 'Pending_Complete_Approval' | 'Pending_Delete_Approval';
  progress?: number;
  client?: string;
  freelancer?: string;
  tasksTotal?: number;
  tasksCompleted?: number;
  lastUpdate?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'ToDo' | 'In_progress' | 'Pending_review' | 'Done' | 'Canceled';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for UI display
  assignee?: string;
  comments?: Array<Comment>;
  filesCount?: number;
  isOverdue?: boolean;
}

export interface Comment {
  id: number;
  taskId: string;
  author: string;
  message: string;
  time: string;
}

export interface FileUploadRequest {
  projectId: string;
  taskId?: string;
  file: File;
}

export interface FileResponse {
  id: number;
  taskId: string;
  filename: string;
  projectTitle: string;
  size: number;
  uploader: string;
  uploadedAt: string;
  path: string;
  contentType: string;
}

export interface AddCommentRequest {
  taskId: string;
  projectId: string;
  comment: string;
}

export interface UserProfile {
  id: string;
  name: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  tasksPending: number;
  projectsCount: number;
  tasksCompleted: number;
  filesUploaded: number;
}

export interface UpdateProfileDto {
  name?: string;
  bio?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export type NotificationType = 
  | 'task_status_changed' 
  | 'task_approved' 
  | 'project_status_updated' 
  | 'invited_to_project' 
  | 'invitation_accepted' 
  | 'invitation_declined' 
  | 'new_comment';

export interface NotificationMetadata {
  resourceType?: 'project' | 'task' | 'comment' | 'file' | 'invitation';
  resourceId?: string;
  projectId?: string;
  taskId?: string;
  fileId?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  actionUrl: string;
  isRead: boolean;
  metadata?: NotificationMetadata;
}

export interface Invitation {
  id: string;
  projectId: string;
  projectTitle: string;
  inviter: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  invitationDate: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  isExpired: boolean;
}

// Pagination types
export interface PagedList<T> {
  items: T[];
  page: number | null;
  pageSize: number | null;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export class ApiError extends Error {
  status: number;
  
  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}