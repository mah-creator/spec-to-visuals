import { useState, useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "../App";
import { 
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  Upload,
  Download,
  MessageSquare,
  Send,
  CheckCircle,
  Timer,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const ProjectWorkspace = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");

  // Mock project data
  const project = {
    id: 1,
    title: "E-commerce Website Redesign",
    description: "Complete redesign of the company's e-commerce platform with modern UI/UX principles",
    client: "TechCorp Inc.",
    freelancer: "John Doe",
    dueDate: "2024-02-15",
    status: "in-progress",
    progress: 67
  };

  const tasks = [
    {
      id: 1,
      title: "Homepage Design",
      description: "Create modern homepage layout with hero section",
      status: "completed",
      dueDate: "2024-01-15",
      assignee: "John Doe",
      comments: [
        { id: 1, author: "Jane Smith", message: "Looks great! Can we make the hero image a bit larger?", time: "2 hours ago" },
        { id: 2, author: "John Doe", message: "Sure, I'll update that in the next iteration.", time: "1 hour ago" }
      ]
    },
    {
      id: 2,
      title: "Product Catalog Layout",
      description: "Design product listing and detail pages",
      status: "in-progress",
      dueDate: "2024-01-20",
      assignee: "John Doe",
      comments: [
        { id: 1, author: "Jane Smith", message: "Please ensure mobile responsiveness", time: "1 day ago" }
      ]
    },
    {
      id: 3,
      title: "Checkout Process",
      description: "Streamline the checkout flow and payment integration",
      status: "pending",
      dueDate: "2024-01-25",
      assignee: "John Doe",
      comments: []
    }
  ];

  const files = [
    { id: 1, name: "Homepage-Design-v2.figma", size: "2.4 MB", uploadedBy: "John Doe", date: "2 hours ago", type: "design" },
    { id: 2, name: "Style-Guide.pdf", size: "1.8 MB", uploadedBy: "John Doe", date: "1 day ago", type: "document" },
    { id: 3, name: "Logo-Assets.zip", size: "12.3 MB", uploadedBy: "Jane Smith", date: "2 days ago", type: "archive" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in-progress': return <Timer className="w-4 h-4 text-primary" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'completed': 'bg-success/10 text-success',
      'in-progress': 'bg-primary/10 text-primary',
      'pending': 'bg-muted/50 text-muted-foreground'
    };
    return variants[status] || 'bg-muted';
  };

  const handleAddComment = (taskId: number) => {
    if (!newComment.trim()) return;
    // Here you would typically add the comment to the task
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-[var(--content-width)] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{project.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                {user?.role === 'freelancer' ? project.client : project.freelancer}
              </p>
            </div>
            <Badge className={getStatusBadge(project.status)}>
              {project.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-width)] mx-auto px-6 py-8">
        {/* Project Overview */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Project Description</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Timeline</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due {project.dueDate}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Progress</h3>
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-primary font-medium">{project.progress}% complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tasks")}
            className={activeTab === "tasks" ? "bg-card shadow-sm" : ""}
          >
            Tasks
          </Button>
          <Button
            variant={activeTab === "files" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("files")}
            className={activeTab === "files" ? "bg-card shadow-sm" : ""}
          >
            Files
          </Button>
        </div>

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tasks</h2>
              {user?.role === 'freelancer' && (
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-muted-foreground text-sm">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Due {task.dueDate}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {task.assignee}
                      </span>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">Comments ({task.comments.length})</span>
                      </div>
                      
                      <div className="space-y-3 pl-6">
                        {task.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{comment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">{comment.time}</span>
                              </div>
                              <p className="text-sm">{comment.message}</p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(task.id)}
                            />
                            <Button size="sm" onClick={() => handleAddComment(task.id)}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Project Files</h2>
              <Button className="bg-gradient-primary">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.size} • Uploaded by {file.uploadedBy} • {file.date}
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
        )}
      </div>
    </div>
  );
};

export default ProjectWorkspace;