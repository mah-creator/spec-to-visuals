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
import { useRecentFiles, useTaskFiles } from "@/hooks/useFiles";
import { API_BASE_URL } from "@/lib/api-client";
import { getTimeDifference } from "@/lib/utils"; // Common path for cn utility

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
  UserCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";



const CustomerDashboard = () => {
  const { profile } = useProfile();
  const [avatarTimestamp] = useState(Date.now());
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();


  var notifications = [
    // { type: "task", message: "Task 'Homepage Design' has been completed", time: "2 hours ago", project: "E-commerce Website" },
    // { type: "comment", message: "New comment on 'Logo Review' task", time: "4 hours ago", project: "Brand Identity" },
    // { type: "file", message: "New design files uploaded", time: "6 hours ago", project: "E-commerce Website" }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { class: string; icon: any }> = {
      'Active': { class: 'bg-primary/10 text-primary', icon: Timer },
      'Completed': { class: 'bg-success/10 text-success', icon: CheckCircle }
    };
    const config = variants[status] || { class: 'bg-muted', icon: Timer };
    const Icon = config.icon;
    return (
      <Badge className={`${config.class} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const { files: recentFiles, isLoading: filesLoading } = useRecentFiles();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-[var(--content-width)] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Client Portal</h1>
                <p className="text-sm text-muted-foreground">Customer Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={profile?.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}?t=${avatarTimestamp}` : ''} 
                    />
                    <AvatarFallback>
                      {user?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                    {/* <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback>{user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar> */}
                    <div className="text-sm text-left">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-muted-foreground">{user?.role}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
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
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}</h2>
          <p className="text-muted-foreground">Here's what's happening with your projects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Projects</h3>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i} className="border-0 shadow-md animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No projects found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  projects.map((project) => (
                    <Card 
                      key={project.id} 
                      className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">{project.title}</h4>
                            <p className="text-muted-foreground flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {project.freelancer || 'No freelancer assigned'}
                            </p>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                            </span>
                            <span className="text-muted-foreground">
                              {project.tasksCompleted || 0}/{project.tasksTotal || 0} tasks completed
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress * 100 || 0}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-primary font-medium">{(project.progress*100).toPrecision(3) || 0}% complete</span>
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Updated {project.lastUpdate || 'recently'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Recent Files */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Files</h3>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    {filesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading files...</p>
                      </div>
                    ) : recentFiles.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        {/* <p className="text-muted-foreground">No files uploaded yet</p> */}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{file.filename}</p>
                                <p className="text-sm text-muted-foreground">
                                  {file.size < (1024**2) ? `${Math.round(file.size / 1024)} KB` : `${(file.size / (1024**2.0)).toFixed(2)} MB`}  • Uploaded by {file.uploader} • {getTimeDifference(new Date(`${file.uploadedAt}Z`))}
                                </p>
                              </div>
                            </div>
                            <a href={`${API_BASE_URL}/api/Files/${file.id}`} target="_blank">
                              <Button variant="ghost" size="sm">
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

          {/* Notifications & Activity */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Notifications</h3>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.project}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Feedback
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download All Files
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
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