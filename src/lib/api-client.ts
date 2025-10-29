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
  UserProfile,
  UserStats,
  UpdateProfileDto,
  ChangePasswordDto,
  Notification,
  Invitation,
  ApiError, 
  Comment
} from '@/types/api';

export const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'https://mit-programming-conditioning-elsewhere.trycloudflare.com';

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
        // Handle 401 errors by logging out and redirecting
        if (response.status == 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const problemDetails = await response.json();
            // Use title from ProblemDetails if available
            errorMessage = problemDetails.title || errorMessage;
            // If there are validation errors, format them
            if (problemDetails.errors) {
              const validationErrors = Object.entries(problemDetails.errors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('; ');
              errorMessage = `${errorMessage} - ${validationErrors}`;
            }
          } else {
            errorMessage = await response.text() || errorMessage;
          }
        } catch (parseError) {
          // If parsing fails, use the default error message
        }
        throw new ApiError({
          message: errorMessage,
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
  async getProjects(params?: { page?: number; pageSize?: number; status?: string }): Promise<import('@/types/api').PagedList<Project>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    const queryString = queryParams.toString();
    return this.request<import('@/types/api').PagedList<Project>>(`/api/Projects${queryString ? `?${queryString}` : ''}`);
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
  async getTasks(projectId: string, params?: { page?: number; pageSize?: number }): Promise<import('@/types/api').PagedList<Task>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString();
    return this.request<import('@/types/api').PagedList<Task>>(`/api/projects/${projectId}/Tasks${queryString ? `?${queryString}` : ''}`);
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

  async updateProjectStatus(
    projectId: string,
    status: string
  ): Promise<void> {
    return this.request<void>(`/api/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // File endpoints
  async uploadFile(
    uploadData: FileUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<FileResponse> {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('projectId', uploadData.projectId);
    if (uploadData.taskId) {
      formData.append('taskId', uploadData.taskId);
    }

    const url = `${API_BASE_URL}/api/Files/upload`;
    const token = this.getToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const contentType = xhr.getResponseHeader('content-type');
            if (contentType && contentType.includes('application/json')) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              resolve(xhr.responseText as unknown as FileResponse);
            }
          } catch (error) {
            reject(new ApiError({
              message: 'Failed to parse response',
              status: xhr.status,
            }));
          }
        } else {
          reject(new ApiError({
            message: xhr.responseText || `HTTP error! status: ${xhr.status}`,
            status: xhr.status,
          }));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError({
          message: 'Network error',
          status: 0,
        }));
      });

      xhr.open('POST', url);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  async getTaskFiles(taskId: string, params?: { page?: number; pageSize?: number }): Promise<import('@/types/api').PagedList<FileResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString();
    return this.request<import('@/types/api').PagedList<FileResponse>>(`/api/Files/task/${taskId}${queryString ? `?${queryString}` : ''}`);
  }

  async getRecentFiles(params?: { page?: number; pageSize?: number }): Promise<import('@/types/api').PagedList<FileResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString();
    return this.request<import('@/types/api').PagedList<FileResponse>>(`/api/Files/recent${queryString ? `?${queryString}` : ''}`);
  }

  async getProjectFiles(projectId: string, params?: { page?: number; pageSize?: number }): Promise<import('@/types/api').PagedList<FileResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString();
    return this.request<import('@/types/api').PagedList<FileResponse>>(`/api/Files/project/${projectId}${queryString ? `?${queryString}` : ''}`);
  }

  // async addTaskComment(projectId: string, taskId: string, comment: Comment): Promise<void> {
  //   return this.request<Comment>(`/api/projects/${projectId}/Tasks/${taskId}/comment`, {
  //     method: 'POST',
  //     body: JSON.stringify(comment),
  //   });
  // }

  async addTaskComment(projectId: string, taskId: string, comment: string): Promise<Comment> {
  const response = await this.request<Comment>(`/api/projects/${projectId}/Tasks/${taskId}/comment`, {
    method: 'POST',
    body: JSON.stringify(comment),
  });
  return response;
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

  // Profile endpoints
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/users/profile');
  }

  async updateProfile(data: UpdateProfileDto): Promise<void> {
    return this.request<void>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    return this.request<void>('/api/Auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/api/users/avatar`;
    const token = this.getToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new ApiError({
            message: xhr.responseText || `HTTP error! status: ${xhr.status}`,
            status: xhr.status,
          }));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError({
          message: 'Network error',
          status: 0,
        }));
      });

      xhr.open('POST', url);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  async getUserStats(): Promise<UserStats> {
    return this.request<UserStats>(`/api/users/stats`);
  }

  // Notification endpoints
  async getNotifications(params?: { page?: number; pageSize?: number }): Promise<import('@/types/api').PagedList<Notification>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString();
    return this.request<import('@/types/api').PagedList<Notification>>(`/api/Notification${queryString ? `?${queryString}` : ''}`);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    return this.request<void>(`/api/Notification/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationAsRead(): Promise<void> {
    return this.request<void>(`/api/Notification/read-all`, {
      method: 'PATCH',
    });
  }

  // Invitation endpoints
  async getInvitations(params?: { page?: number; pageSize?: number }): Promise<import('@/types/api').PagedList<Invitation>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString();
    return this.request<import('@/types/api').PagedList<Invitation>>(`/api/Invitation${queryString ? `?${queryString}` : ''}`);
  }

  async getInvitationsByStatus(params?: {status: string; page?: number; pageSize?: number }): Promise<import('@/types/api').PagedList<Invitation>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString();
    return this.request<import('@/types/api').PagedList<Invitation>>(`/api/Invitation/status/${params.status}${queryString ? `?${queryString}` : ''}`);
  }

  async acceptInvitation(invitationId: string): Promise<void> {
    return this.request<void>(`/api/Invitation/${invitationId}/accept`, {
      method: 'PUT',
    });
  }

  async declineInvitation(invitationId: string): Promise<void> {
    return this.request<void>(`/api/Invitation/${invitationId}/decline`, {
      method: 'PUT',
    });
  }
}

export const apiClient = new ApiClient();
