import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthContext } from "../App";
import { useProjects } from "@/hooks/useProjects";
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Bell,
  LogOut,
  BarChart3,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompletedTasks, usePendingTasks } from "@/hooks/useTasks";

const FreelancerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();

  // Calculate stats from real data
  const activeProjects = projects.filter(p => 
    p.status === 'Active'
  ).length;

  const completedTasks = useCompletedTasks()?.task?.length ?? 0;
  const pendingTasks = usePendingTasks()?.task?.length ?? 0;

  const recentActivity = [
    { type: "task", message: "Task 'Homepage Design' marked as completed", time: "2 hours ago" },
    { type: "comment", message: "New comment from TechCorp Inc.", time: "4 hours ago" },
    { type: "file", message: "Design assets uploaded to Mobile App project", time: "6 hours ago" },
    { type: "project", message: "New project invitation sent to Creative Agency", time: "1 day ago" }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'in-progress': 'bg-primary/10 text-primary',
      'planning': 'bg-warning/10 text-warning',
      'review': 'bg-success/10 text-success',
      'completed': 'bg-success/10 text-success'
    };
    return variants[status] || 'bg-muted';
  };

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
                <p className="text-sm text-muted-foreground">Freelancer Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full"></span>
              </Button>
              
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-muted-foreground">{user?.role}</div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-width)] mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{activeProjects}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold">{`${completedTasks}`}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold">{`${pendingTasks}`}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">$4,200</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Active Projects</h2>
              <Button className="bg-gradient-primary hover:shadow-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
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
                    <p className="text-muted-foreground">No projects found. Create your first project to get started!</p>
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
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {project.client || 'No client assigned'}
                          </p>
                        </div>
                        <Badge className={getStatusBadge(project.status)}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                        <span>{project.tasksCompleted || 0}/{project.tasksTotal || 0} tasks</span>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all"
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{project.progress || 0}% complete</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;