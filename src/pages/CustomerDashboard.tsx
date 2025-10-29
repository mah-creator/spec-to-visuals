import { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthContext } from "../App";
import { useProjects } from "@/hooks/useProjects";
import { useRecentFiles } from "@/hooks/useFiles";
import { API_BASE_URL } from "@/lib/api-client";
import { getTimeDifference, cn, formatTimestamp } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Bell,
  LogOut,
  Download,
  MessageSquare,
  CheckCircle,
  Timer,
  AlertTriangle,
  UserCircle,
  CircleX,
  ArrowUpRight,
  PlayCircle,
  Eye,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import FileTypeIcon from "@/components/ui/FileTypeIcon";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { useNotifications } from "@/hooks/useNotifications";
import { getNotificationUrl } from "@/lib/utils";

const CustomerDashboard = () => {
  const { profile } = useProfile();
  const [avatarTimestamp] = useState(Date.now());
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projectsPage, setProjectsPage] = useState(1);
  const [filesPage, setFilesPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);
  const projectsPageSize = 6;
  const filesPageSize = 5;
  const { projects, isLoading, totalPages: projectsTotalPages } = useProjects(
    projectsPage, 
    projectsPageSize, 
    selectedStatus === 'all' ? undefined : selectedStatus
  );

  const { files: recentFiles, isLoading: filesLoading, totalPages: filesTotalPages } = useRecentFiles(filesPage, filesPageSize);
  
  // Get real notifications
  const { notifications: realNotifications, isLoading: notificationsLoading, markAsRead } = useNotifications(1, 5);
  
  const unreadNotifications = realNotifications.filter(n => !n.isRead);

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalTasks = projects.reduce((sum, project) => sum + (project.tasksTotal || 0), 0);
  const completedTasks = projects.reduce((sum, project) => sum + (project.tasksCompleted || 0), 0);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
      case 'task_status_changed':
        return <CheckCircle className="w-4 h-4" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4" />;
      case 'file_uploaded':
        return <FileText className="w-4 h-4" />;
      case 'project_status_changed':
        return <TrendingUp className="w-4 h-4" />;
      case 'invitation_received':
        return <Users className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-400';
    
    switch (type) {
      case 'task_created':
      case 'task_updated':
      case 'task_status_changed':
        return 'bg-green-500';
      case 'comment_added':
        return 'bg-blue-500';
      case 'file_uploaded':
        return 'bg-amber-500';
      case 'project_status_changed':
        return 'bg-purple-500';
      case 'invitation_received':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    const url = getNotificationUrl(notification.metadata);
    if (url) {
      navigate(url);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Deleted': 'bg-red-100 text-red-800 border-red-200',
      'Active': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Pending_Complete_Approval': 'bg-amber-100 text-amber-800 border-amber-200',
      'Pending_Delete_Approval': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return variants[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Pending_Complete_Approval': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'Pending_Delete_Approval': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'Deleted': return <CircleX className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Handle deep linking to projects
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setHighlightedProjectId(projectId);
      
      // Scroll to project
      setTimeout(() => {
        const projectElement = document.getElementById(`project-${projectId}`);
        if (projectElement) {
          projectElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Clear highlight and URL after animation
      setTimeout(() => {
        setHighlightedProjectId(null);
        searchParams.delete('projectId');
        setSearchParams(searchParams, { replace: true });
      }, 3000);
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[var(--content-width)] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
                <p className="text-sm text-gray-600">Customer Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationsDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 transition-colors">
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarImage 
                        src={profile?.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}?t=${avatarTimestamp}` : ''} 
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {user?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-left">
                      <div className="font-medium text-gray-900">{profile?.name}</div>
                      <div className="text-gray-600 capitalize">{user?.role}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border border-gray-200 shadow-lg">
                  <DropdownMenuLabel className="text-gray-900">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer text-gray-700 hover:bg-gray-50"
                  >
                    <UserCircle className="w-4 h-4 mr-2 text-gray-600" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-width)] mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}</h2>
          <p className="text-gray-600">Here's what's happening with your projects</p>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects & Files */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Your Projects</h3>
                  <p className="text-sm text-gray-600 mt-1">Track progress and manage deliverables</p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <Tabs 
                value={selectedStatus} 
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setProjectsPage(1); // Reset to first page when changing status
                }}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-4 bg-gray-100/50">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
                  >
                    All Projects
                  </TabsTrigger>
                  <TabsTrigger 
                    value="Active" 
                    className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Active
                  </TabsTrigger>
                  <TabsTrigger 
                    value="Completed" 
                    className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="Deleted" 
                    className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800"
                  >
                    <CircleX className="w-4 h-4 mr-2" />
                    Deleted
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i} className="border border-gray-200 shadow-sm animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                          <div className="h-2 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <Card className="border border-gray-200 shadow-sm text-center py-12">
                    <CardContent>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">No projects yet</h3>
                      <p className="text-gray-600">Projects will appear here once created</p>
                    </CardContent>
                  </Card>
                ) : (
                  projects.map((project) => {
                    const progress = project.progress || 0;
                    const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();
                    
                    return (
                      <Card 
                        key={project.id}
                        id={`project-${project.id}`}
                        className={cn(
                          "border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group",
                          highlightedProjectId === project.id && "flash-highlight"
                        )}
                        onClick={() => navigate(`/project/${project.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">

                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                                  {project.title}
                                </h4>
                                <p className="text-gray-600 flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4" />
                                  {project.freelancer || 'No freelancer assigned'}
                                </p>
                              </div>
                            </div>
                            <Badge className={cn("border px-3 py-1 rounded-full text-sm font-medium", getStatusBadge(project.status))}>
                              {project.status.split('_').map((word, i) => 
                                i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
                              ).join(' ')}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {project.dueDate ? (
                                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                    Due {new Date(project.dueDate).toLocaleDateString()}
                                  </span>
                                ) : (
                                  'No due date'
                                )}
                              </span>
                              <span className="text-gray-700 font-medium">
                                {project.tasksCompleted || 0}/{project.tasksTotal || 0} tasks
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-600 font-medium">{progress.toFixed(1)}% complete</span>
                              <span className="text-gray-500 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                                View project
                                <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
              {projectsTotalPages > 1 && (
                <Pagination 
                  currentPage={projectsPage}
                  totalPages={projectsTotalPages}
                  onPageChange={setProjectsPage}
                  className="mt-6"
                />
              )}
            </div>

            {/* Recent Files */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Recent Files</h3>
                  <p className="text-sm text-gray-600 mt-1">Latest uploads from your projects</p>
                </div>
              </div>
              
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  {filesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading files...</p>
                    </div>
                  ) : recentFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No files uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                              <FileTypeIcon 
                                mimeType={file.contentType} 
                                filename={file.filename}
                                className="w-5 h-5 text-blue-600"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{file.filename}</p>
                              <p className="text-sm text-gray-500">
                                {file.size < (1024**2) ? `${Math.round(file.size / 1024)} KB` : `${(file.size / (1024**2.0)).toFixed(2)} MB`} • Uploaded by {file.uploader} • {getTimeDifference(new Date(`${file.uploadedAt}Z`))}
                              </p>
                            </div>
                          </div>
                          <a href={`${API_BASE_URL}/api/Files/${file.id}`} download={file.filename}>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {filesTotalPages > 1 && (
                    <Pagination 
                      currentPage={filesPage}
                      totalPages={filesTotalPages}
                      onPageChange={setFilesPage}
                      className="mt-4"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
                {unreadNotifications.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {unreadNotifications.length} new
                  </Badge>
                )}
              </div>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  {notificationsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2 text-sm">Loading notifications...</p>
                    </div>
                  ) : realNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {realNotifications.map((notification, index) => (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "flex gap-3 group cursor-pointer rounded-lg p-2 -m-2 transition-colors",
                            !notification.isRead && "bg-blue-50/50 hover:bg-blue-100/50",
                            notification.isRead && "hover:bg-gray-50"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2",
                              getNotificationColor(notification.type, notification.isRead)
                            )}></div>
                            {index < realNotifications.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                "text-sm transition-colors",
                                !notification.isRead ? "text-gray-900 font-medium" : "text-gray-700",
                                "group-hover:text-gray-900"
                              )}>
                                {notification.message}
                              </p>
                              <div className={cn(
                                "flex-shrink-0",
                                getNotificationColor(notification.type, notification.isRead).replace('bg-', 'text-')
                              )}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(notification.timestamp)}
                            </p>
                            {!notification.isRead && (
                              <Badge className="bg-blue-500 text-white border-0 text-xs mt-1 px-1.5 py-0">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
                    Send Feedback
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2 text-gray-600" />
                    Download All Files
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                    Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;