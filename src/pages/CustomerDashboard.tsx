import { useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AuthContext } from "../App";
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
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      title: "E-commerce Website Redesign",
      freelancer: "John Doe",
      dueDate: "2024-02-15",
      status: "in-progress",
      tasksTotal: 12,
      tasksCompleted: 8,
      progress: 67,
      lastUpdate: "2 hours ago"
    },
    {
      id: 2,
      title: "Brand Identity Package",
      freelancer: "Sarah Wilson",
      dueDate: "2024-01-30",
      status: "review",
      tasksTotal: 8,
      tasksCompleted: 8,
      progress: 100,
      lastUpdate: "1 day ago"
    }
  ];

  const recentFiles = [
    { name: "Homepage-Design-v2.figma", project: "E-commerce Website", uploadedBy: "John Doe", date: "2 hours ago" },
    { name: "Logo-Concepts.pdf", project: "Brand Identity", uploadedBy: "Sarah Wilson", date: "1 day ago" },
    { name: "Style-Guide.pdf", project: "Brand Identity", uploadedBy: "Sarah Wilson", date: "2 days ago" }
  ];

  const notifications = [
    { type: "task", message: "Task 'Homepage Design' has been completed", time: "2 hours ago", project: "E-commerce Website" },
    { type: "comment", message: "New comment on 'Logo Review' task", time: "4 hours ago", project: "Brand Identity" },
    { type: "file", message: "New design files uploaded", time: "6 hours ago", project: "E-commerce Website" }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { class: string; icon: any }> = {
      'in-progress': { class: 'bg-primary/10 text-primary', icon: Timer },
      'review': { class: 'bg-warning/10 text-warning', icon: AlertTriangle },
      'completed': { class: 'bg-success/10 text-success', icon: CheckCircle }
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
                {projects.map((project) => (
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
                            {project.freelancer}
                          </p>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Due {project.dueDate}
                          </span>
                          <span className="text-muted-foreground">
                            {project.tasksCompleted}/{project.tasksTotal} tasks completed
                          </span>
                        </div>
                        
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-primary font-medium">{project.progress}% complete</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {project.lastUpdate}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Files */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Files</h3>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.project} • {file.uploadedBy} • {file.date}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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