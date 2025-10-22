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
  status?: 'Active' | 'Completed' | 'Deleted';
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
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for UI display
  assignee?: string;
  comments?: Array<{
    id: number;
    author: string;
    message: string;
    time: string;
  }>;
}

export interface FileUploadRequest {
  projectId: string;
  taskId?: string;
  file: File;
}

export interface FileResponse {
  filename: string;
  projectTitle: string;
  size: number;
  uploader: string;
  uploadedAt: string;
  path: string;
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
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
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

export class ApiError extends Error {
  status: number;
  
  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}