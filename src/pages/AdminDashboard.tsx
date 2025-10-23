import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { 
  Users, 
  FileText, 
  Bell,
  LogOut,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  UserX,
  Settings,
  BarChart3,
  Clock,
  UserCircle
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { API_BASE_URL } from "@/lib/api-client";

const AdminDashboard = () => {
  const { profile } = useProfile();
  const [avatarTimestamp] = useState(Date.now());
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const stats = [
    { label: "Total Users", value: "124", change: "+12%", icon: Users, trend: "up" },
    { label: "Active Projects", value: "45", change: "+8%", icon: FileText, trend: "up" },
    { label: "System Alerts", value: "3", change: "-2", icon: AlertTriangle, trend: "down" },
    { label: "Storage Used", value: "68%", change: "+5%", icon: BarChart3, trend: "up" }
  ];

  const recentUsers = [
    { name: "John Doe", email: "john@example.com", role: "Freelancer", status: "Active", joined: "2 days ago" },
    { name: "Jane Smith", email: "jane@company.com", role: "Customer", status: "Active", joined: "3 days ago" },
    { name: "Mike Johnson", email: "mike@freelance.com", role: "Freelancer", status: "Suspended", joined: "1 week ago" },
    { name: "Sarah Wilson", email: "sarah@design.com", role: "Freelancer", status: "Active", joined: "2 weeks ago" }
  ];

  const systemAlerts = [
    { type: "security", message: "Multiple failed login attempts from IP 192.168.1.100", time: "10 min ago", severity: "high" },
    { type: "storage", message: "Storage usage approaching 80% capacity", time: "2 hours ago", severity: "medium" },
    { type: "performance", message: "Database response time increased by 15%", time: "4 hours ago", severity: "low" }
  ];

  const projectActivity = [
    { project: "E-commerce Website", freelancer: "John Doe", client: "TechCorp", action: "File uploaded", time: "1 hour ago" },
    { project: "Mobile App", freelancer: "Sarah Wilson", client: "StartupXYZ", action: "Task completed", time: "3 hours ago" },
    { project: "Brand Identity", freelancer: "Mike Johnson", client: "Creative Agency", action: "Comment added", time: "5 hours ago" }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Active': 'bg-success/10 text-success',
      'Suspended': 'bg-danger/10 text-danger',
      'Pending': 'bg-warning/10 text-warning'
    };
    return variants[status] || 'bg-muted';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'high': 'text-danger',
      'medium': 'text-warning',
      'low': 'text-muted-foreground'
    };
    return colors[severity] || 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-[var(--content-width)] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-danger to-danger/80 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">System Management</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-8 h-8 text-primary" />
                  <div className={`text-sm font-medium ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Management */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent Users</h3>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </div>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge className={getStatusBadge(user.status)}>
                              {user.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{user.role}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Activity */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {projectActivity.map((activity, index) => (
                      <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.freelancer}</span> {activity.action.toLowerCase()} in{' '}
                            <span className="font-medium">{activity.project}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Client: {activity.client} • {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Alerts */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">System Alerts</h3>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {systemAlerts.map((alert, index) => (
                      <div key={index} className="p-3 rounded-lg border-l-4 border-danger/50 bg-danger/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {alert.time}
                            </p>
                          </div>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
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
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    System Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
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

export default AdminDashboard;