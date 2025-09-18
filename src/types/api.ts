// API Types based on OpenAPI spec
export interface LoginRequest {
  email: string;
  password: string;
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
  token: string;
  user: User;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface FileUploadRequest {
  projectId: string;
  taskId?: string;
  file: File;
}

export class ApiError extends Error {
  status: number;
  
  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}