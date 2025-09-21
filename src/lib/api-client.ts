import { 
  LoginRequest, 
  LoginResponse, 
  SignupRequest,
  CreateProjectDto, 
  CreateTaskDto, 
  UpdateTaskStatusDto,
  Project,
  Task,
  FileUploadRequest,
  FileResponse,
  ApiError 
} from '@/types/api';

export const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:56545';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new ApiError({
          message: errorData || `HTTP error! status: ${response.status}`,
          status: response.status,
        });
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      });
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: SignupRequest): Promise<void> {
    return this.request<void>('/api/Auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/Projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/Projects/${id}`);
  }

  async createProject(project: CreateProjectDto): Promise<Project> {
    return this.request<Project>('/api/Projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async inviteToProject(projectId: string, email: string): Promise<void> {
    return this.request<void>(`/api/Projects/${projectId}/invite`, {
      method: 'POST',
      body: JSON.stringify(email),
    });
  }

  // Task endpoints
  async getTasks(projectId: string): Promise<Task[]> {
    return this.request<Task[]>(`/api/projects/${projectId}/Tasks`);
  }

  async getCompletedTasks(): Promise<Task[]> {
    return (await this.request<Task[]>(`/api/tasks/completed`));
  }

  async getPendingTasks(): Promise<Task[]> {
    return (await this.request<Task[]>(`/api/tasks/pending`));
  }

  async getTask(projectId: string, taskId: string): Promise<Task> {
    return this.request<Task>(`/api/projects/${projectId}/Tasks/${taskId}`);
  }

  async createTask(projectId: string, task: CreateTaskDto): Promise<Task> {
    return this.request<Task>(`/api/projects/${projectId}/Tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTaskStatus(
    projectId: string, 
    taskId: string, 
    status: UpdateTaskStatusDto
  ): Promise<void> {
    return this.request<void>(`/api/projects/${projectId}/Tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    });
  }

  // File endpoints
  async uploadFile(uploadData: FileUploadRequest): Promise<FileResponse> {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('projectId', uploadData.projectId);
    if (uploadData.taskId) {
      formData.append('taskId', uploadData.taskId);
    }

    const url = `${API_BASE_URL}/api/Files/upload`;
    const token = this.getToken();

    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new ApiError({
          message: errorData || `HTTP error! status: ${response.status}`,
          status: response.status,
        });
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as unknown as FileResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      });
    }
  }

  async getTaskFiles(taskId: string): Promise<FileResponse[]> {
    return this.request<FileResponse[]>(`/api/Files/task/${taskId}`);
  }

  async getRecentFiles(): Promise<FileResponse[]> {
    return this.request<FileResponse[]>(`/api/Files/recent`);
  }

  async getProjectFiles(projectId: string): Promise<FileResponse[]> {
    return this.request<FileResponse[]>(`/api/Files/project/${projectId}`);
  }

  async addTaskComment(projectId: string, taskId: string, comment: string): Promise<void> {
    return this.request<void>(`/api/projects/${projectId}/Tasks/${taskId}/comment`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  // Admin endpoints
  async suspendUser(userId: string): Promise<void> {
    return this.request<void>(`/api/admin/suspend/${userId}`, {
      method: 'POST',
    });
  }

  async unsuspendUser(userId: string): Promise<void> {
    return this.request<void>(`/api/admin/unsuspend/${userId}`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
