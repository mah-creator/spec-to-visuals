import { useContext, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { getTimeDifference, cn } from "@/lib/utils";
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

const CustomerDashboard = () => {
  const { profile } = useProfile();
  const [avatarTimestamp] = useState(Date.now());
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();

  const notifications = [
    { type: "task", message: "Task 'Homepage Design' has been completed", time: "2 hours ago", project: "E-commerce Website" },
    { type: "comment", message: "New comment on 'Logo Review' task", time: "4 hours ago", project: "Brand Identity" },
    { type: "file", message: "New design files uploaded", time: "6 hours ago", project: "E-commerce Website" }
  ];

  const { files: recentFiles, isLoading: filesLoading } = useRecentFiles();

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalTasks = projects.reduce((sum, project) => sum + (project.tasksTotal || 0), 0);
  const completedTasks = projects.reduce((sum, project) => sum + (project.tasksCompleted || 0), 0);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Deleted': 'bg-red-100 text-red-800 border-red-200',
      'Active': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200'
    };
    return variants[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending_review': return <Eye className="w-4 h-4 text-amber-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

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
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
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
                    const progress = project.progress * 100 || 0;
                    const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();
                    
                    return (
                      <Card 
                        key={project.id} 
                        className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
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
                              {project.status.replace('_', ' ')}
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
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
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
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {notifications.length} new
                </Badge>
              </div>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={index} className="flex gap-3 group">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-2",
                            notification.type === 'task' ? 'bg-green-500' :
                            notification.type === 'comment' ? 'bg-blue-500' :
                            notification.type === 'file' ? 'bg-amber-500' : 'bg-purple-500'
                          )}></div>
                          {index < notifications.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4 group-last:pb-0">
                          <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notification.project}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    View all notifications
                  </Button>
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